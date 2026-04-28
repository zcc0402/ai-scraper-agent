import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/browser/mcp-client", () => ({
  mcpClient: {
    callTool: vi.fn().mockResolvedValue({ content: "mocked" }),
  },
}));

describe("Browser Tools", () => {
  it("should return array of tools with required fields", async () => {
    const { createBrowserTools } = await import("@/lib/agent/tools");
    const tools = createBrowserTools();

    expect(tools.length).toBeGreaterThan(0);
    for (const tool of tools) {
      expect(tool).toHaveProperty("name");
      expect(tool).toHaveProperty("description");
      expect(tool).toHaveProperty("execute");
      expect(typeof tool.execute).toBe("function");
    }
  });

  it("should include navigate tool", async () => {
    const { createBrowserTools } = await import("@/lib/agent/tools");
    const tools = createBrowserTools();
    const navigate = tools.find((t) => t.name === "navigate");
    expect(navigate).toBeDefined();
  });

  it("should include snapshot tool", async () => {
    const { createBrowserTools } = await import("@/lib/agent/tools");
    const tools = createBrowserTools();
    const snapshot = tools.find((t) => t.name === "snapshot");
    expect(snapshot).toBeDefined();
  });
});
