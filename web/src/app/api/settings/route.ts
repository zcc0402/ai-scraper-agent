import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";

export async function GET() {
  const all = await db.select().from(settings);
  const map: Record<string, unknown> = {};
  for (const s of all) {
    map[s.key] = s.value;
  }
  return NextResponse.json(map);
}

export async function PUT(req: Request) {
  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() },
      });
  }
  return NextResponse.json({ success: true });
}
