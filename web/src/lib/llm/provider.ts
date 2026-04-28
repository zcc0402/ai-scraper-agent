import { getModel, stream, complete, type Context, type Tool } from "@mariozechner/pi-ai";

export function getLLMModel() {
  const provider = (process.env.LLM_PROVIDER || "google") as any;
  const model = process.env.LLM_MODEL || "gemini-2.5-flash";

  // Try to get predefined model first
  const predefinedModel = getModel(provider, model);
  if (predefinedModel) return predefinedModel;

  // Create custom model for OpenAI-compatible providers
  const baseUrl = process.env.LLM_BASE_URL;
  const apiKey = process.env.LLM_API_KEY;

  if (baseUrl && apiKey) {
    return {
      id: model,
      name: model,
      api: "openai-completions" as const,
      provider: provider as any,
      baseUrl: baseUrl,
      reasoning: false,
      input: ["text" as const],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: 128000,
      maxTokens: 4096,
    };
  }

  throw new Error(`Unknown provider/model: ${provider}/${model}. Set LLM_BASE_URL and LLM_API_KEY for custom providers.`);
}

export async function streamCompletion(context: Context) {
  const model = getLLMModel();
  return stream(model, context);
}

export async function completeCompletion(context: Context) {
  const model = getLLMModel();
  return complete(model, context);
}

export type { Context, Tool };
