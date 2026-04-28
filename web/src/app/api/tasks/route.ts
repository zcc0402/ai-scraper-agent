import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { addScrapeJob } from "@/lib/queue/producer";
import { desc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit")) || 20;
  const offset = Number(url.searchParams.get("offset")) || 0;
  const status = url.searchParams.get("status");

  let query = db.select().from(tasks).orderBy(desc(tasks.createdAt));

  if (status) {
    query = query.where(eq(tasks.status, status as any)) as typeof query;
  }

  const result = await query.limit(limit).offset(offset);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { userInput, outputFormat, skillName } = body;

  if (!userInput || typeof userInput !== "string") {
    return NextResponse.json({ error: "userInput is required" }, { status: 400 });
  }

  const [task] = await db
    .insert(tasks)
    .values({
      userInput,
      outputFormat: outputFormat || "json",
      skillName: skillName || null,
      status: "pending",
    })
    .returning();

  await addScrapeJob({
    taskId: task.id,
    userInput,
    skillName,
    outputFormat: outputFormat || "json",
  });

  return NextResponse.json(task);
}
