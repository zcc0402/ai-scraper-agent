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

      const skill = skillRegistry.match(userInput);

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

      const result = await agent.prompt(userInput);

      taskEvents.publish(taskId, { type: "status", status: "exporting" });
      const file = await exportData(
        Array.isArray(result) ? result : [result],
        (outputFormat as any) || "json"
      );

      await db.update(tasks)
        .set({
          status: "completed",
          resultData: result,
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
