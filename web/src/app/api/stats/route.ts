import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";

export async function GET() {
  try {
    const totalTasks = await db.select({ count: count() }).from(tasks);
    const completedTasks = await db
      .select({ count: count() })
      .from(tasks)
      .where(eq(tasks.status, "completed"));
    const runningTasks = await db
      .select({ count: count() })
      .from(tasks)
      .where(eq(tasks.status, "running"));

    return NextResponse.json({
      totalTasks: totalTasks[0]?.count || 0,
      completedTasks: completedTasks[0]?.count || 0,
      runningTasks: runningTasks[0]?.count || 0,
      successRate: totalTasks[0]?.count
        ? Math.round((completedTasks[0]?.count / totalTasks[0]?.count) * 100)
        : 0,
    });
  } catch {
    return NextResponse.json({
      totalTasks: 0,
      completedTasks: 0,
      runningTasks: 0,
      successRate: 0,
    });
  }
}
