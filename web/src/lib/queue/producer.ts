import { Queue } from "bullmq";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
};

export const scrapeQueue = new Queue("scrape", { connection });

export async function addScrapeJob(params: {
  taskId: string;
  userInput: string;
  targetUrl?: string;
  skillName?: string;
  outputFormat?: string;
  timeout?: number;
}) {
  return scrapeQueue.add("scrape", params, {
    attempts: 2,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { age: 86400 },
    removeOnFail: { age: 604800 },
  });
}
