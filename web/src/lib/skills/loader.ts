import matter from "gray-matter";
import { readFile, readdir } from "fs/promises";
import { join, basename, extname } from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import type { Skill } from "./types";

const execFileAsync = promisify(execFile);

export async function loadOpenClawSkill(skillDir: string): Promise<Skill> {
  const content = await readFile(join(skillDir, "SKILL.md"), "utf-8");
  const { data, content: body } = matter(content);

  const scriptsDir = join(skillDir, "scripts");
  let scripts: string[] = [];
  try {
    const files = await readdir(scriptsDir);
    scripts = files
      .filter((f) => /\.(py|ts|js)$/.test(f))
      .map((f) => join(scriptsDir, f));
  } catch {
    // scripts 目录不存在
  }

  return {
    name: data.name,
    displayName: data.name,
    description: data.description || "",
    version: data.version || "1.0.0",
    type: "openclaw",
    match: () => true,
    tools: scripts.map((script) => ({
      name: `run_${basename(script, extname(script))}`,
      description: `Run ${basename(script)}`,
      execute: async (args: Record<string, unknown>) => {
        const { stdout } = await execFileAsync(script, Object.values(args).map(String));
        return stdout;
      },
    })),
    systemPrompt: body,
    scripts,
  };
}

export async function loadNativeSkill(path: string): Promise<Skill> {
  const mod = await import(path);
  return mod.default;
}
