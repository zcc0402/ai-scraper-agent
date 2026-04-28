import { NextResponse } from "next/server";
import { skillRegistry } from "@/lib/skills/registry";

export async function GET() {
  const skills = skillRegistry.list().map((s) => ({
    name: s.name,
    displayName: s.displayName,
    description: s.description,
    version: s.version,
    type: s.type,
  }));
  return NextResponse.json(skills);
}
