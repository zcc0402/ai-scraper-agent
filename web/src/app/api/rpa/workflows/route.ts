import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rpaWorkflows } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const workflows = await db.select().from(rpaWorkflows).orderBy(desc(rpaWorkflows.createdAt));
  return NextResponse.json(workflows);
}
