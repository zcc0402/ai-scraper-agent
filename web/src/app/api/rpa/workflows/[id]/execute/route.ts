import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rpaWorkflows, executionHistory } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { executeRPA } from "@/lib/rpa/executor";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [workflow] = await db
    .select()
    .from(rpaWorkflows)
    .where(eq(rpaWorkflows.id, id));

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const start = Date.now();
  try {
    await executeRPA(workflow.steps as any);
    await db.insert(executionHistory).values({
      workflowId: id,
      status: "success",
      duration: Date.now() - start,
    });
    return NextResponse.json({ status: "success" });
  } catch (err: any) {
    await db.insert(executionHistory).values({
      workflowId: id,
      status: "failed",
      duration: Date.now() - start,
      result: { error: err.message },
    });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
