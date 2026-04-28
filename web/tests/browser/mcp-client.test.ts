import { describe, it, expect } from "vitest";

describe("Playwright MCP Client", () => {
  it("should export mcpClient singleton", async () => {
    const mod = await import("@/lib/browser/mcp-client");
    expect(mod.mcpClient).toBeDefined();
    expect(typeof mod.mcpClient.connect).toBe("function");
    expect(typeof mod.mcpClient.callTool).toBe("function");
    expect(typeof mod.mcpClient.disconnect).toBe("function");
  });
});
