import { Type } from "@sinclair/typebox";
import { mcpClient } from "@/lib/browser/mcp-client";
import type { AgentTool, AgentToolResult } from "@mariozechner/pi-agent-core";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { TaskEventBus } from "@/lib/queue/events";

function makeResult(data: unknown): AgentToolResult<unknown> {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data) }],
    details: data,
  };
}

let screenshotCounter = 0;

export function resetScreenshotCounter() {
  screenshotCounter = 0;
}

async function captureScreenshot(
  taskId: string,
  toolName: string,
  eventBus: TaskEventBus
): Promise<void> {
  try {
    const result = await mcpClient.callTool("browser_take_screenshot");
    const mcpResult = result as { content?: Array<{ type: string; data?: string; text?: string }> };

    // MCP returns content array - look for image type with base64 data
    let base64Data: string | undefined;
    if (mcpResult?.content) {
      for (const block of mcpResult.content) {
        if (block.type === "image" && block.data) {
          base64Data = block.data;
          break;
        }
      }
    }
    // Fallback: check top-level data field
    if (!base64Data) {
      base64Data = (result as { data?: string })?.data;
    }

    if (base64Data) {
      screenshotCounter++;
      const dir = join(process.cwd(), "uploads", "screenshots", taskId);
      await mkdir(dir, { recursive: true });
      const buffer = Buffer.from(base64Data, "base64");
      const filename = String(screenshotCounter).padStart(3, "0") + ".png";
      await writeFile(join(dir, filename), buffer);

      eventBus.publish(taskId, {
        type: "screenshot_taken",
        index: screenshotCounter,
        url: `/api/tasks/${taskId}/screenshots/${screenshotCounter}`,
        toolName,
        timestamp: Date.now(),
      });
    }
  } catch (err) {
    console.error("[tools] Failed to capture screenshot:", err);
  }
}

export function createBrowserTools(
  taskId?: string,
  eventBus?: TaskEventBus
): AgentTool[] {
  return [
    {
      name: "navigate",
      label: "Navigate",
      description: "Navigate browser to a URL",
      parameters: Type.Object({ url: Type.String() }),
      execute: async (_toolCallId: string, params: any) => {
        const result = await mcpClient.callTool("browser_navigate", { url: params.url });
        if (taskId && eventBus) {
          await captureScreenshot(taskId, "navigate", eventBus);
        }
        return makeResult(result);
      },
    },
    {
      name: "snapshot",
      label: "Snapshot",
      description: "Get accessibility tree snapshot of the current page",
      parameters: Type.Object({}),
      execute: async (_toolCallId: string) => {
        const result = await mcpClient.callTool("browser_snapshot");
        return makeResult(result);
      },
    },
    {
      name: "click",
      label: "Click",
      description: "Click an element by its ref ID from snapshot",
      parameters: Type.Object({ ref: Type.String() }),
      execute: async (_toolCallId: string, params: any) => {
        const result = await mcpClient.callTool("browser_click", { uid: params.ref });
        if (taskId && eventBus) {
          await captureScreenshot(taskId, "click", eventBus);
        }
        return makeResult(result);
      },
    },
    {
      name: "fill",
      label: "Fill",
      description: "Fill an input field by its ref ID",
      parameters: Type.Object({ ref: Type.String(), value: Type.String() }),
      execute: async (_toolCallId: string, params: any) => {
        const result = await mcpClient.callTool("browser_fill", {
          uid: params.ref,
          value: params.value,
        });
        if (taskId && eventBus) {
          await captureScreenshot(taskId, "fill", eventBus);
        }
        return makeResult(result);
      },
    },
    {
      name: "scroll",
      label: "Scroll",
      description: "Scroll the page up or down",
      parameters: Type.Object({ direction: Type.String() }),
      execute: async (_toolCallId: string, params: any) => {
        const result = await mcpClient.callTool("browser_scroll", {
          direction: params.direction,
        });
        return makeResult(result);
      },
    },
    {
      name: "screenshot",
      label: "Screenshot",
      description: "Take a screenshot of the current page",
      parameters: Type.Object({}),
      execute: async (_toolCallId: string) => {
        const result = await mcpClient.callTool("browser_take_screenshot");
        if (taskId && eventBus) {
          await captureScreenshot(taskId, "screenshot", eventBus);
        }
        return makeResult(result);
      },
    },
    {
      name: "wait_for",
      label: "Wait For",
      description: "Wait for text to appear on the page",
      parameters: Type.Object({
        text: Type.String(),
        timeout: Type.Optional(Type.Number()),
      }),
      execute: async (_toolCallId: string, params: any) => {
        const result = await mcpClient.callTool("browser_wait_for", {
          text: [params.text],
          timeout: params.timeout || 10000,
        });
        return makeResult(result);
      },
    },
  ];
}
