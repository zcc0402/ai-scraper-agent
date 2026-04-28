import { getModel, stream, complete, type Context, type Tool } from "@mariozechner/pi-ai";

export function getLLMModel() {
  const provider = (process.env.LLM_PROVIDER || "google") as any;
  const model = process.env.LLM_MODEL || "gemini-2.5-flash";
  return getModel(provider, model);
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
