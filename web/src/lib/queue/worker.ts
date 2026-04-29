import { Worker } from "bullmq";
import { createScraperAgent } from "@/lib/agent/factory";
import { skillRegistry } from "@/lib/skills/registry";
import { taskEvents } from "./events";
import { db } from "@/lib/db";
import { tasks, taskEvents as taskEventsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { exportData } from "@/lib/export/exporter";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
};

export function startWorker() {
  // Set up event persistence to database
  taskEvents.setPersistFn((taskId, event) => {
    db.insert(taskEventsTable)
      .values({ taskId, type: event.type, data: event })
      .catch((err) => console.error("[worker] Failed to persist event:", err));
  });

  const worker = new Worker(
    "scrape",
    async (job) => {
      const { taskId, userInput, targetUrl, skillName, outputFormat } = job.data;

      console.log(`[worker] Processing task ${taskId}: "${userInput}"`);

      // Build enhanced prompt with target URL context
      const enhancedInput = targetUrl
        ? `目标网址: ${targetUrl}\n\n任务: ${userInput}`
        : userInput;

      const skill = skillName
        ? skillRegistry.get(skillName) || skillRegistry.match(userInput)
        : skillRegistry.match(userInput);
      console.log(`[worker] Matched skill: ${skill.name}`);

      await db.update(tasks).set({ status: "running" }).where(eq(tasks.id, taskId));
      taskEvents.publish(taskId, { type: "status", status: "running" });

      const agent = createScraperAgent(
        skill,
        (event) => {
          taskEvents.publish(taskId, event);

          const statusMap: Record<string, string> = {
            turn_start: "planning",
            tool_execution_start: "navigating",
            tool_execution_end: "extracting",
          };
          if (statusMap[event.type]) {
            db.update(tasks)
              .set({ status: statusMap[event.type] as any })
              .where(eq(tasks.id, taskId));
          }
        },
        taskId,
        taskEvents
      );

      await agent.prompt(enhancedInput);

      // Get the last assistant message as the result
      const messages = agent.state.messages;
      console.log(`[worker] Agent completed with ${messages.length} messages`);

      const lastAssistant = [...messages].reverse().find((m: any) => m.role === "assistant");
      let result = "";

      if (lastAssistant?.content) {
        const content = lastAssistant.content as any[];
        if (Array.isArray(content)) {
          // Extract text from all content blocks
          const textBlocks = content.filter((c: any) => c.type === "text");
          if (textBlocks.length > 0) {
            result = textBlocks.map((c: any) => c.text).join("\n");
          } else {
            // Fallback: stringify the entire content
            result = JSON.stringify(content);
          }
        } else if (typeof content === "string") {
          result = content;
        }
      }

      console.log(`[worker] Result: ${result.substring(0, 200)}...`);

      taskEvents.publish(taskId, { type: "status", status: "exporting" });
      let parsedResult: any;
      try {
        parsedResult = JSON.parse(result);
      } catch {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = result.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
        if (jsonMatch) {
          try {
            parsedResult = JSON.parse(jsonMatch[1].trim());
          } catch {
            parsedResult = result;
          }
        } else {
          parsedResult = result;
        }
      }

      const filePath = await exportData(
        Array.isArray(parsedResult) ? parsedResult : [parsedResult],
        (outputFormat as any) || "json",
        taskId
      );

      await db.update(tasks)
        .set({
          status: "completed",
          resultData: parsedResult,
          outputFile: filePath,
          completedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));

      taskEvents.publish(taskId, { type: "completed", result });
      return { result };
    },
    { connection }
  );

  worker.on("failed", async (job, err) => {
    if (job) {
      await db.update(tasks)
        .set({ status: "failed", errorMessage: err.message })
        .where(eq(tasks.id, job.data.taskId));
      taskEvents.publish(job.data.taskId, { type: "failed", error: err.message });
    }
  });

  return worker;
}
