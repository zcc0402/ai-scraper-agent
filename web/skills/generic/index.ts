import type { Skill } from "@/lib/skills/types";

const genericSkill: Skill = {
  name: "generic",
  displayName: "通用网页爬虫",
  description: "适用于任意网页的数据提取",
  version: "1.0.0",
  type: "native",
  match: () => true,
  tools: [],
  systemPrompt: `你是一个智能网页数据提取助手。
用户会用自然语言描述想抓取的数据。
你需要：
1. 分析用户意图，确定目标 URL 和数据字段
2. 使用浏览器工具访问页面
3. 通过无障碍树快照理解页面结构
4. 提取用户需要的数据
5. 以结构化 JSON 格式返回结果

输出格式: JSON 数组，每个元素是一条数据记录。`,
};

export default genericSkill;
