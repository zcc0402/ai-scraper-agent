import type { Skill } from "./types";

export const genericSkill: Skill = {
  name: "generic",
  displayName: "通用爬虫",
  description: "通用网页数据抓取技能",
  version: "1.0.0",
  type: "native",
  match: () => true,
  systemPrompt: `你是一个网页数据抓取专家。你可以使用浏览器工具来导航网页、提取数据。
请按照用户的要求，使用浏览器工具抓取数据，并以结构化的 JSON 格式返回结果。
工作流程：
1. 使用 navigate 工具打开目标网页
2. 使用 snapshot 工具查看页面内容
3. 使用 click/fill 等工具进行交互（如需要）
4. 提取所需数据
5. 以 JSON 数组格式返回结果`,
  tools: [],
};
