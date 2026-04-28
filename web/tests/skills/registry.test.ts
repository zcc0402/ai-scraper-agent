import { describe, it, expect } from "vitest";

describe("SkillRegistry", () => {
  it("should register and match skills", async () => {
    const { SkillRegistry } = await import("@/lib/skills/registry");
    const registry = new SkillRegistry();

    const skill = {
      name: "test",
      displayName: "Test",
      description: "Test skill",
      version: "1.0.0",
      type: "native" as const,
      match: (url: string) => url.includes("example.com"),
      tools: [],
      systemPrompt: "test",
    };

    registry.register(skill);
    expect(registry.match("https://example.com")).toBe(skill);
  });

  it("should fallback to generic skill", async () => {
    const { SkillRegistry } = await import("@/lib/skills/registry");
    const registry = new SkillRegistry();

    const generic = {
      name: "generic",
      displayName: "Generic",
      description: "Generic skill",
      version: "1.0.0",
      type: "native" as const,
      match: () => true,
      tools: [],
      systemPrompt: "generic",
    };

    registry.register(generic);
    expect(registry.match("https://unknown.com")).toBe(generic);
  });

  it("should list all skills", async () => {
    const { SkillRegistry } = await import("@/lib/skills/registry");
    const registry = new SkillRegistry();

    registry.register({
      name: "a", displayName: "A", description: "", version: "1.0.0",
      type: "native", match: () => false, tools: [], systemPrompt: "",
    });
    registry.register({
      name: "b", displayName: "B", description: "", version: "1.0.0",
      type: "native", match: () => false, tools: [], systemPrompt: "",
    });

    expect(registry.list()).toHaveLength(2);
  });
});
