import { complete } from "@mariozechner/pi-ai";
import { getLLMModel } from "@/lib/llm/provider";
import type { RecordedAction } from "./recorder";

export interface RPAStep {
  action: string;
  target: string;
  value?: string;
  description: string;
}

export async function optimizeToRPA(
  actions: RecordedAction[],
  originalGoal: string
): Promise<RPAStep[]> {
  const model = getLLMModel();

  const response = await complete(model, {
    systemPrompt: `你是一个 RPA 工作流优化专家。
用户录制了一组浏览器操作，你需要：
1. 去掉冗余操作（如误点击、重复操作）
2. 合并连续的同类操作
3. 添加有意义的描述
4. 输出结构化的步骤列表
返回 JSON 数组，每步包含 action, target, description 字段。`,
    messages: [
      {
        role: "user",
        content: `原始目标: ${originalGoal}\n\n录制的操作:\n${JSON.stringify(actions, null, 2)}`,
        timestamp: Date.now(),
      },
    ],
    tools: [],
  });

  const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
  return JSON.parse(content);
}
