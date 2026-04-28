export interface AgentTool {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}

export interface Skill {
  name: string;
  displayName: string;
  description: string;
  version: string;
  author?: string;
  type: "native" | "openclaw";
  match: (url: string) => boolean;
  tools: AgentTool[];
  systemPrompt: string;
  workflow?: string;
  scripts?: string[];
}
