import { Agent, type AgentTool, type AgentEvent, type AgentToolResult } from "@mariozechner/pi-agent-core";
import { Type } from "@sinclair/typebox";
import { getLLMModel } from "@/lib/llm/provider";
import { createBrowserTools, resetScreenshotCounter } from "./tools";
import { SCRAPER_SYSTEM_PROMPT } from "./prompts";
import type { Skill } from "@/lib/skills/types";
import type { TaskEventBus } from "@/lib/queue/events";

export type { AgentEvent };

function makeResult(data: unknown): AgentToolResult<unknown> {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data) }],
    details: data,
  };
}

function skillToolsToAgentTools(skillTools: Skill["tools"]): AgentTool[] {
  return skillTools.map((tool) => ({
    name: tool.name,
    label: tool.name,
    description: tool.description,
    parameters: Type.Object(
      Object.fromEntries(
        Object.entries(tool.parameters || {}).map(([k]) => [k, Type.String()])
      )
    ),
    execute: async (_toolCallId: string, params: any) => {
      const result = await tool.execute(params as Record<string, unknown>);
      return makeResult(result);
    },
  }));
}

export function createScraperAgent(
  skill: Skill,
  onEvent?: (event: AgentEvent) => void,
  taskId?: string,
  eventBus?: TaskEventBus
) {
  if (taskId) resetScreenshotCounter();
  const browserTools = createBrowserTools(taskId, eventBus);
  const extraTools = skillToolsToAgentTools(skill.tools);
  const tools = [...browserTools, ...extraTools];

  const agent = new Agent({
    initialState: {
      systemPrompt: skill.systemPrompt || SCRAPER_SYSTEM_PROMPT,
      model: getLLMModel(),
      tools,
    },
    getApiKey: async (provider: string) => {
      if (provider === process.env.LLM_PROVIDER) {
        return process.env.LLM_API_KEY;
      }
      return undefined;
    },
  });

  if (onEvent) {
    agent.subscribe((event: AgentEvent) => {
      onEvent(event);
    });
  }

  return agent;
}
