import { describe, it, expect } from "vitest";

describe("LLM Provider", () => {
  it("should export getLLMModel function", async () => {
    const mod = await import("@/lib/llm/provider");
    expect(typeof mod.getLLMModel).toBe("function");
  });

  it("should export streamCompletion function", async () => {
    const mod = await import("@/lib/llm/provider");
    expect(typeof mod.streamCompletion).toBe("function");
  });
});
