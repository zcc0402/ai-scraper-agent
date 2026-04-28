import { Type } from "@sinclair/typebox";
import { mcpClient } from "@/lib/browser/mcp-client";
import type { AgentTool, AgentToolResult } from "@mariozechner/pi-agent-core";

function makeResult(data: unknown): AgentToolResult<unknown> {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data) }],
    details: data,
  };
}

export function createBrowserTools(): AgentTool[] {
  return [
    {
      name: "navigate",
      label: "Navigate",
      description: "Navigate browser to a URL",
      parameters: Type.Object({ url: Type.String() }),
      execute: async (_toolCallId: string, params: any) => {
        const result = await mcpClient.callTool("browser_navigate", { url: params.url });
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
        const result = await mcpClient.callTool("browser_screenshot");
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
