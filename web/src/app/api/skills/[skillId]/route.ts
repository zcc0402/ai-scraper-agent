import { NextResponse } from "next/server";
import { skillRegistry } from "@/lib/skills/registry";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ skillId: string }> }
) {
  const { skillId } = await params;
  const skill = skillRegistry.get(skillId);

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: skill.name,
    displayName: skill.displayName,
    description: skill.description,
    version: skill.version,
    type: skill.type,
  });
}
