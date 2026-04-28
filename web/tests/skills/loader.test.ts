import { describe, it, expect } from "vitest";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";

describe("OpenClaw Skill Loader", () => {
  const tmpDir = join(__dirname, "__tmp_skill__");

  it("should parse SKILL.md frontmatter", async () => {
    mkdirSync(join(tmpDir, "scripts"), { recursive: true });
    writeFileSync(join(tmpDir, "SKILL.md"), `---
name: test-scraper
description: A test scraper
---
# Test Scraper
This is a test.`);
    writeFileSync(join(tmpDir, "scripts", "scrape.py"), "print('hello')");

    const { loadOpenClawSkill } = await import("@/lib/skills/loader");
    const skill = await loadOpenClawSkill(tmpDir);

    expect(skill.name).toBe("test-scraper");
    expect(skill.description).toBe("A test scraper");
    expect(skill.type).toBe("openclaw");
    expect(skill.scripts).toHaveLength(1);

    rmSync(tmpDir, { recursive: true });
  });
});
