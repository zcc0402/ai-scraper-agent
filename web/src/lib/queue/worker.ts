import { Worker } from "bullmq";
import { createScraperAgent } from "@/lib/agent/factory";
import { skillRegistry } from "@/lib/skills/registry";
import { taskEvents } from "./events";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { exportData } from "@/lib/export/exporter";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
};

export function startWorker() {
  const worker = new Worker(
    "scrape",
    async (job) => {
      const { taskId, userInput, skillName, outputFormat } = job.data;

      console.log(`[worker] Processing task ${taskId}: "${userInput}"`);

      const skill = skillRegistry.match(userInput);
      console.log(`[worker] Matched skill: ${skill.name}`);

      await db.update(tasks).set({ status: "running" }).where(eq(tasks.id, taskId));
      taskEvents.publish(taskId, { type: "status", status: "running" });

      const agent = createScraperAgent(skill, (event) => {
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
      });

      await agent.prompt(userInput);

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
        parsedResult = result;
      }

      const file = await exportData(
        Array.isArray(parsedResult) ? parsedResult : [parsedResult],
        (outputFormat as any) || "json"
      );

      await db.update(tasks)
        .set({
          status: "completed",
          resultData: parsedResult,
          outputFile: typeof file === "string" ? file : undefined,
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
