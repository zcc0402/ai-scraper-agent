import { describe, it, expect, vi } from "vitest";

vi.mock("@mariozechner/pi-ai", () => ({
  getModel: vi.fn(),
  complete: vi.fn().mockResolvedValue({
    content: JSON.stringify([
      { action: "navigate", target: "https://example.com", description: "Open page" },
      { action: "click", target: "@e5", description: "Click search button" },
    ]),
  }),
}));

describe("RPA Optimizer", () => {
  it("should export optimizeToRPA function", async () => {
    const mod = await import("@/lib/rpa/optimizer");
    expect(typeof mod.optimizeToRPA).toBe("function");
  });
});
