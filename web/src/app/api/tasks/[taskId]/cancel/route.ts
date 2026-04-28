import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { taskEvents } from "@/lib/queue/events";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  await db.update(tasks)
    .set({ status: "cancelled" })
    .where(eq(tasks.id, taskId));

  taskEvents.publish(taskId, { type: "cancelled" });

  return NextResponse.json({ success: true });
}
