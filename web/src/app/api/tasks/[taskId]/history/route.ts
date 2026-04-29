import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { taskEvents } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  const rows = await db
    .select()
    .from(taskEvents)
    .where(eq(taskEvents.taskId, taskId))
    .orderBy(asc(taskEvents.createdAt));

  const events = rows.map((row) => {
    const data = row.data as Record<string, unknown>;
    return {
      ...data,
      createdAt: row.createdAt,
    };
  });

  return NextResponse.json({ events });
}
