import { mcpClient } from "@/lib/browser/mcp-client";
import type { RPAStep } from "./optimizer";

export async function executeRPA(steps: RPAStep[]): Promise<void> {
  for (const step of steps) {
    switch (step.action) {
      case "navigate":
        await mcpClient.callTool("browser_navigate", { url: step.target });
        break;
      case "click":
        await mcpClient.callTool("browser_click", { uid: step.target });
        break;
      case "fill":
        await mcpClient.callTool("browser_fill", {
          uid: step.target,
          value: step.value || "",
        });
        break;
      case "scroll":
        await mcpClient.callTool("browser_scroll", { direction: step.target });
        break;
      case "wait":
        await new Promise((r) => setTimeout(r, Number(step.target) || 1000));
        break;
    }
  }
}
