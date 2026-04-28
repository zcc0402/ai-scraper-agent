# AI Scraper Agent 全栈重构设计文档

> 日期: 2026-04-29
> 状态: 草案

---

## 1. 背景与动机

### 1.1 现有问题

当前 Python 实现存在以下核心问题：

- **Validator Agent 工具是空壳** — 爬取数据没有被验证和导出
- **前端 API baseURL 硬编码内网 IP** — 无法正常工作
- **取消任务 API 方法不匹配** — 前端 DELETE vs 后端 POST
- **英文国际化未实现** — en.json 内容全是中文
- **测试完全缺失** — 三个测试目录全是空的
- **CrewAI 抽象过重** — 调试困难，状态控制弱，Agent 接入不灵活
- **agent-browser 通过 subprocess 调用** — 额外开销，不如直接用 Playwright

### 1.2 重构目标

- 全栈 TypeScript 重构，前后端统一语言
- 参考 pi-mono 的 agent-core 架构，去掉 CrewAI
- 内置 Playwright MCP，用户无感知的自然语言浏览器交互
- 可扩展的 Skill 系统，兼容 OpenClaw SKILL.md 格式
- 录制 → RPA 工作流固化
- 生产级架构（BullMQ 任务队列 + SSE 实时推送）

---

## 2. 技术栈

| 层 | 技术 | 版本 | 说明 |
|---|------|------|------|
| **框架** | Next.js | 16.x (App Router) | 全栈框架 |
| **UI** | shadcn/ui + Tailwind CSS | v4 | 组件库 + CSS |
| **Agent 运行时** | @mariozechner/pi-agent-core | latest | tool-calling 循环 + 状态管理 |
| **LLM API** | @mariozechner/pi-ai | latest | 统一多 provider 适配 |
| **浏览器自动化** | Playwright MCP (@playwright/mcp) | latest | 内置子进程，无障碍树 + Ref |
| **浏览器 SDK** | Playwright (playwright) | latest | 批量数据提取 |
| **任务队列** | BullMQ + Redis | latest | 后台任务执行 |
| **数据库** | Drizzle ORM | latest | ORM + 迁移 |
| **数据库** | SQLite (开发) / PostgreSQL (生产) | - | 数据存储 |
| **实时通信** | Server-Sent Events (SSE) | - | Agent 进度推送 |
| **测试** | Vitest | latest | 单元测试 |
| **包管理** | pnpm | latest | 依赖管理 |

---

## 3. 架构设计

### 3.1 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│  用户浏览器                                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Next.js Frontend (React + shadcn/ui + Tailwind v4) │   │
│  │  ├── 首页 (统计 + 功能介绍)                           │   │
│  │  ├── 任务管理 (创建/列表/详情)                        │   │
│  │  ├── Agent 可视化 (实时步骤展示)                      │   │
│  │  ├── Skill 市场 (浏览/安装/管理)                      │   │
│  │  └── 设置 (LLM 配置/主题/语言)                       │   │
│  └──────────────────┬───────────────────────────────────┘   │
└─────────────────────┼───────────────────────────────────────┘
                      │ HTTP + SSE
┌─────────────────────┼───────────────────────────────────────┐
│  Next.js API Routes │                                       │
│  ┌──────────┐  ┌────▼─────┐  ┌───────────┐  ┌───────────┐  │
│  │ 任务 API │  │ 爬取 API │  │ SSE 推送  │  │ Skill API │  │
│  └────┬─────┘  └────┬─────┘  └─────▲─────┘  └───────────┘  │
└───────┼─────────────┼──────────────┼────────────────────────┘
        │             │              │
        ▼             ▼              │
┌───────────────────────────────┐    │
│      BullMQ + Redis           │    │
│  ┌─────────────────────────┐  │    │
│  │  Worker (Agent 执行)    │──┼────┘ (发布进度事件)
│  │  ├── pi-agent-core      │  │
│  │  ├── pi-ai (LLM)        │  │
│  │  └── Playwright MCP     │  │
│  │     (内置子进程)         │  │
│  └─────────────────────────┘  │
└───────────────────────────────┘
        │
        ▼
┌──────────────────┐
│  SQLite/Postgres │
│  (Drizzle ORM)   │
└──────────────────┘
```

### 3.2 数据流

#### 爬取任务流程

```
用户输入自然语言 ("抓取 Hacker News 前10条标题")
    │
    ▼
POST /api/tasks → 创建任务记录 (status: pending)
    │
    ▼
添加到 BullMQ 队列
    │
    ▼
Worker 获取任务 → 创建 Agent 实例
    │
    ├── Agent subscribe → SSE 事件流
    │
    ▼
pi-agent-core 执行循环:
    │
    ├── Turn 1: LLM 规划 (status: planning)
    │   └── 输出: 访问 news.ycombinator.com，提取标题
    │
    ├── Turn 2: 调用 MCP navigate (status: navigating)
    │   └── Playwright 打开页面
    │
    ├── Turn 3: 调用 MCP snapshot (status: extracting)
    │   └── 返回无障碍树 + Ref
    │
    ├── Turn 4: LLM 分析页面结构 (status: extracting)
    │   └── 识别标题元素，调用 extract 工具
    │
    ├── Turn 5: 数据验证 (status: validating)
    │   └── 检查数据完整性，清洗格式
    │
    └── 完成 → 导出文件 (status: completed)
        │
        ▼
更新任务记录 → SSE 推送完成事件 → 前端展示结果
```

#### Skill 匹配流程

```
用户输入 URL 或描述
    │
    ▼
SkillRegistry.match(url) → 找到匹配的 Skill
    │
    ├── 匹配到 → 使用 Skill 专用的 tools + systemPrompt
    └── 未匹配 → 使用 generic Skill（默认）
```

---

## 4. 模块设计

### 4.1 项目结构

```
ai-scraper/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # 首页
│   │   ├── layout.tsx                # 根布局
│   │   ├── tasks/
│   │   │   ├── page.tsx              # 任务列表
│   │   │   ├── create/page.tsx       # 创建任务
│   │   │   └── [taskId]/page.tsx     # 任务详情
│   │   ├── skills/
│   │   │   ├── page.tsx              # Skill 市场
│   │   │   └── [skillId]/page.tsx    # Skill 详情
│   │   ├── settings/
│   │   │   └── page.tsx              # 设置页
│   │   └── api/
│   │       ├── tasks/
│   │       │   ├── route.ts          # GET 列表, POST 创建
│   │       │   └── [taskId]/
│   │       │       ├── route.ts      # GET 详情
│   │       │       ├── cancel/route.ts
│   │       │       └── events/route.ts  # SSE 推送
│   │       ├── skills/
│   │       │   └── route.ts          # Skill CRUD
│   │       └── settings/
│   │           └── route.ts          # 配置管理
│   │
│   ├── lib/
│   │   ├── agent/
│   │   │   ├── factory.ts            # Agent 创建工厂
│   │   │   ├── tools.ts              # 浏览器工具定义
│   │   │   └── prompts.ts            # 系统提示词
│   │   ├── browser/
│   │   │   ├── mcp-client.ts         # Playwright MCP 客户端
│   │   │   ├── connector.ts          # 浏览器连接（含 CDP 兜底）
│   │   │   └── extractor.ts          # 批量数据提取
│   │   ├── llm/
│   │   │   └── provider.ts           # pi-ai 封装
│   │   ├── queue/
│   │   │   ├── worker.ts             # BullMQ Worker
│   │   │   ├── producer.ts           # 任务入队
│   │   │   └── events.ts             # 事件发布/订阅
│   │   ├── skills/
│   │   │   ├── registry.ts           # Skill 注册表
│   │   │   ├── loader.ts             # Skill 加载器（原生 + OpenClaw）
│   │   │   └── types.ts              # Skill 类型定义
│   │   ├── rpa/
│   │   │   ├── recorder.ts           # 操作录制
│   │   │   ├── optimizer.ts          # Agent 优化录制步骤
│   │   │   └── executor.ts           # RPA 工作流执行
│   │   ├── db/
│   │   │   ├── index.ts              # Drizzle 实例
│   │   │   ├── schema.ts             # 表结构定义
│   │   │   └── migrations/           # 迁移文件
│   │   └── export/
│   │       └── exporter.ts           # JSON/CSV/Excel 导出
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui 组件
│   │   ├── layout/
│   │   │   ├── navbar.tsx
│   │   │   └── sidebar.tsx
│   │   ├── tasks/
│   │   │   ├── task-card.tsx
│   │   │   ├── task-form.tsx
│   │   │   ├── task-list.tsx
│   │   │   └── agent-visualizer.tsx  # Agent 执行可视化
│   │   ├── skills/
│   │   │   ├── skill-card.tsx
│   │   │   └── skill-installer.tsx
│   │   └── rpa/
│   │       ├── recorder-panel.tsx
│   │       └── workflow-viewer.tsx
│   │
│   └── hooks/
│       ├── use-task.ts               # 任务状态管理
│       ├── use-sse.ts                # SSE 连接
│       └── use-agent-events.ts       # Agent 事件处理
│
├── skills/                           # 内置 Skills
│   ├── generic/
│   │   └── index.ts                  # 通用网页爬虫
│   ├── ecommerce/
│   │   └── index.ts                  # 电商专用
│   └── social/
│       └── index.ts                  # 社交媒体
│
├── tests/
│   ├── agent/                        # Agent 测试
│   ├── browser/                      # 浏览器工具测试
│   ├── api/                          # API 测试
│   └── skills/                       # Skill 测试
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vitest.config.ts
├── drizzle.config.ts
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

### 4.2 Agent 引擎

基于 `@mariozechner/pi-agent-core`，只定义爬虫工具：

```typescript
// src/lib/agent/factory.ts
import { Agent } from "@mariozechner/pi-agent-core";
import { getModel } from "@mariozechner/pi-ai";
import { createBrowserTools } from "./tools";
import { SCRAPER_SYSTEM_PROMPT } from "./prompts";
import type { Skill } from "@/lib/skills/types";

export function createScraperAgent(skill: Skill, onEvent?: (event: AgentEvent) => void) {
  const tools = [
    ...createBrowserTools(),    // Playwright MCP 工具
    ...skill.tools,             // Skill 专用工具
  ];

  const agent = new Agent({
    initialState: {
      systemPrompt: skill.systemPrompt || SCRAPER_SYSTEM_PROMPT,
      model: getModel(process.env.LLM_PROVIDER, process.env.LLM_MODEL),
      tools,
      messages: [],
    },
  });

  // 订阅事件 → 推送给前端
  if (onEvent) {
    agent.subscribe(onEvent);
  }

  return agent;
}
```

```typescript
// src/lib/agent/tools.ts
import { mcpClient } from "@/lib/browser/mcp-client";
import { extractData } from "@/lib/browser/extractor";

export function createBrowserTools() {
  return [
    {
      name: "navigate",
      description: "Navigate to a URL",
      parameters: { url: "string" },
      execute: ({ url }) => mcpClient.callTool("browser_navigate", { url }),
    },
    {
      name: "snapshot",
      description: "Get accessibility tree snapshot of the page",
      execute: () => mcpClient.callTool("browser_snapshot"),
    },
    {
      name: "click",
      description: "Click an element by its ref ID",
      parameters: { ref: "string" },
      execute: ({ ref }) => mcpClient.callTool("browser_click", { uid: ref }),
    },
    {
      name: "fill",
      description: "Fill an input field",
      parameters: { ref: "string", value: "string" },
      execute: ({ ref, value }) => mcpClient.callTool("browser_fill", { uid: ref, value }),
    },
    {
      name: "scroll",
      description: "Scroll the page",
      parameters: { direction: "up | down" },
      execute: ({ direction }) => mcpClient.callTool("browser_scroll", { direction }),
    },
    {
      name: "screenshot",
      description: "Take a screenshot of the page",
      execute: () => mcpClient.callTool("browser_screenshot"),
    },
    {
      name: "extract_text",
      description: "Extract text content from elements matching a selector",
      parameters: { selector: "string" },
      execute: ({ selector }) => extractData(selector),
    },
    {
      name: "wait_for",
      description: "Wait for an element to appear",
      parameters: { selector: "string", timeout: "number?" },
      execute: ({ selector, timeout }) =>
        mcpClient.callTool("browser_wait_for", { text: selector, timeout }),
    },
  ];
}
```

### 4.3 Playwright MCP 客户端

内置子进程，用户无感知：

```typescript
// src/lib/browser/mcp-client.ts
import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio";

class PlaywrightMCPClient {
  private client: Client;
  private transport: StdioClientTransport;

  async connect() {
    this.transport = new StdioClientTransport({
      command: "npx",
      args: [
        "@playwright/mcp@latest",
        "--headless",
        "--isolated",
      ],
    });

    this.client = new Client({ name: "ai-scraper", version: "1.0.0" });
    await this.client.connect(this.transport);
  }

  async callTool(name: string, args?: Record<string, unknown>) {
    const result = await this.client.callTool({ name, arguments: args });
    return result;
  }

  async disconnect() {
    await this.client.close();
  }
}

// 全局单例
export const mcpClient = new PlaywrightMCPClient();
```

### 4.4 浏览器连接器（含 CDP 兜底）

```typescript
// src/lib/browser/connector.ts
import { chromium, type Browser } from "playwright";

export interface BrowserOptions {
  mode: "managed" | "cdp";
  cdpEndpoint?: string;  // e.g., "http://localhost:9222"
  headless?: boolean;
}

export async function connectBrowser(options: BrowserOptions): Promise<Browser> {
  if (options.mode === "cdp" && options.cdpEndpoint) {
    // CDP 模式：连接用户已有的 Chrome
    return chromium.connectOverCDP(options.cdpEndpoint);
  }

  // 默认：启动新的 Playwright 浏览器
  return chromium.launch({
    headless: options.headless ?? true,
  });
}
```

### 4.5 Skill 系统

```typescript
// src/lib/skills/types.ts
import type { AgentTool } from "@mariozechner/pi-agent-core";

export interface Skill {
  name: string;
  displayName: string;
  description: string;
  version: string;
  author?: string;
  type: "native" | "openclaw";

  // 匹配规则
  match: (url: string) => boolean;

  // 工具集
  tools: AgentTool[];

  // 系统提示词
  systemPrompt: string;

  // 推荐工作流（可选）
  workflow?: string;

  // OpenClaw skill 的脚本文件路径（仅 type=openclaw）
  scripts?: string[];
}
```

```typescript
// src/lib/skills/loader.ts
import matter from "gray-matter";
import { readFile, glob } from "fs/promises";
import type { Skill } from "./types";

// 加载原生 TypeScript Skill
export async function loadNativeSkill(path: string): Promise<Skill> {
  const mod = await import(path);
  return mod.default;
}

// 加载 OpenClaw Skill（SKILL.md + scripts/）
export async function loadOpenClawSkill(skillDir: string): Promise<Skill> {
  const content = await readFile(`${skillDir}/SKILL.md`, "utf-8");
  const { data, body } = matter(content);
  const scripts = await glob(`${skillDir}/scripts/*.{py,ts,js}`);

  return {
    name: data.name,
    displayName: data.name,
    description: data.description,
    version: "1.0.0",
    type: "openclaw",
    match: () => true, // 默认匹配，可由用户自定义
    tools: scripts.map((script) => ({
      name: `run_${basename(script, extname(script))}`,
      description: `Run ${basename(script)}`,
      execute: (args: Record<string, string>) =>
        execFileAsync(script, Object.values(args)),
    })),
    systemPrompt: body,
    scripts,
  };
}
```

```typescript
// src/lib/skills/registry.ts
import type { Skill } from "./types";
import { loadNativeSkill, loadOpenClawSkill } from "./loader";

class SkillRegistry {
  private skills = new Map<string, Skill>();

  // 注册原生 Skill
  register(skill: Skill) {
    this.skills.set(skill.name, skill);
  }

  // 导入 OpenClaw Skill
  async importOpenClaw(path: string) {
    const skill = await loadOpenClawSkill(path);
    this.skills.set(skill.name, skill);
  }

  // 根据 URL 匹配
  match(url: string): Skill {
    for (const skill of this.skills.values()) {
      if (skill.match(url)) return skill;
    }
    return this.skills.get("generic")!; // 回退到通用 Skill
  }

  // 列出所有
  list(): Skill[] {
    return [...this.skills.values()];
  }
}

export const skillRegistry = new SkillRegistry();
```

### 4.6 任务队列

```typescript
// src/lib/queue/worker.ts
import { Worker } from "bullmq";
import { createScraperAgent } from "@/lib/agent/factory";
import { skillRegistry } from "@/lib/skills/registry";
import { publishEvent } from "./events";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const worker = new Worker(
  "scrape",
  async (job) => {
    const { taskId, userInput, skillName, outputFormat } = job.data;

    // 匹配 Skill
    const skill = skillName
      ? skillRegistry.match(skillName)
      : skillRegistry.match(userInput);

    // 更新状态
    await db.update(tasks).set({ status: "running" }).where(eq(tasks.id, taskId));
    publishEvent(taskId, { type: "status", status: "running" });

    // 创建 Agent
    const agent = createScraperAgent(skill, (event) => {
      // 推送 Agent 事件到前端
      publishEvent(taskId, event);

      // 更新任务状态
      const statusMap: Record<string, string> = {
        turn_start: "planning",
        tool_execution_start: "navigating",
        tool_execution_end: "extracting",
      };
      if (statusMap[event.type]) {
        db.update(tasks)
          .set({ status: statusMap[event.type] })
          .where(eq(tasks.id, taskId));
      }
    });

    // 执行
    const result = await agent.prompt(userInput);

    // 导出数据
    publishEvent(taskId, { type: "status", status: "exporting" });
    const file = await exportData(result, outputFormat);

    // 完成
    await db.update(tasks)
      .set({
        status: "completed",
        resultData: result,
        outputFile: file,
        completedAt: new Date(),
      })
      .where(eq(tasks.id, taskId));

    publishEvent(taskId, { type: "completed", result, file });

    return { result, file };
  },
  { connection: { host: process.env.REDIS_HOST, port: 6379 } }
);

worker.on("failed", async (job, err) => {
  await db.update(tasks)
    .set({ status: "failed", errorMessage: err.message })
    .where(eq(tasks.id, job.data.taskId));
});
```

### 4.7 SSE 实时推送

```typescript
// src/app/api/tasks/[taskId]/events/route.ts
import { subscribeToTask } from "@/lib/queue/events";

export async function GET(req: Request, { params }: { params: { taskId: string } }) {
  const { taskId } = params;

  const stream = new ReadableStream({
    start(controller) {
      const unsubscribe = subscribeToTask(taskId, (event) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
      });

      // 心跳
      const heartbeat = setInterval(() => {
        controller.enqueue(new TextEncoder().encode(": heartbeat\n\n"));
      }, 30000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

### 4.8 录制 → RPA

```typescript
// src/lib/rpa/recorder.ts
import { chromium } from "playwright";

interface RecordedAction {
  type: "navigate" | "click" | "fill" | "scroll" | "wait";
  selector?: string;
  ref?: string;
  value?: string;
  url?: string;
  timestamp: number;
}

export class ActionRecorder {
  private actions: RecordedAction[] = [];
  private browser: Browser;
  private page: Page;

  async start(url: string) {
    this.browser = await chromium.launch({ headless: false });
    this.page = await this.browser.newPage();

    // 注入录制脚本
    await this.page.addInitScript(() => {
      // 监听点击、输入等事件
      document.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        window.__recordedActions?.push({
          type: "click",
          selector: generateSelector(target),
          ref: target.getAttribute("data-ref"),
          timestamp: Date.now(),
        });
      });

      document.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        window.__recordedActions?.push({
          type: "fill",
          selector: generateSelector(target),
          value: target.value,
          timestamp: Date.now(),
        });
      });
    });

    await this.page.goto(url);
  }

  async getActions(): Promise<RecordedAction[]> {
    return this.page.evaluate(() => window.__recordedActions || []);
  }

  async stop(): Promise<RecordedAction[]> {
    const actions = await this.getActions();
    await this.browser.close();
    return actions;
  }
}
```

```typescript
// src/lib/rpa/optimizer.ts
import { complete } from "@mariozechner/pi-ai";
import { getModel } from "@mariozechner/pi-ai";
import type { RecordedAction } from "./recorder";

interface RPAStep {
  action: string;
  target: string;
  value?: string;
  description: string;
}

// 用 LLM 优化录制的原始操作为结构化 RPA 工作流
export async function optimizeToRPA(
  actions: RecordedAction[],
  originalGoal: string
): Promise<RPAStep[]> {
  const model = getModel(process.env.LLM_PROVIDER, process.env.LLM_MODEL);

  const response = await complete(model, {
    systemPrompt: `你是一个 RPA 工作流优化专家。
用户录制了一组浏览器操作，你需要：
1. 去掉冗余操作（如误点击、重复操作）
2. 合并连续的同类操作
3. 添加有意义的描述
4. 优化选择器（优先使用 ref，其次使用语义选择器）
5. 输出结构化的步骤列表`,
    messages: [
      {
        role: "user",
        content: `原始目标: ${originalGoal}

录制的操作:
${JSON.stringify(actions, null, 2)}

请优化为结构化的 RPA 工作流步骤。`,
      },
    ],
    tools: [],
  });

  return JSON.parse(response.content);
}
```

### 4.9 数据库 Schema

```typescript
// src/lib/db/schema.ts
import { pgTable, text, timestamp, jsonb, integer, uuid, varchar, boolean } from "drizzle-orm/pg-core";

// 任务表
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userInput: text("user_input").notNull(),
  skillName: text("skill_name"),
  status: varchar("status", {
    enum: ["pending", "running", "planning", "navigating", "extracting",
           "validating", "exporting", "completed", "failed", "cancelled"],
  }).default("pending"),
  progress: integer("progress").default(0),
  resultData: jsonb("result_data"),
  outputFile: text("output_file"),
  outputFormat: varchar("output_format", { enum: ["json", "csv", "excel"] }).default("json"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Skill 表
export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  version: text("version").notNull(),
  type: varchar("type", { enum: ["native", "openclaw"] }).notNull(),
  source: text("source"),  // "builtin" | "clawhub" | "uploaded"
  config: jsonb("config"), // Skill 配置
  installedAt: timestamp("installed_at").defaultNow(),
});

// RPA 工作流表
export const rpaWorkflows = pgTable("rpa_workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  steps: jsonb("steps").notNull(),         // RPAStep[]
  source: varchar("source", { enum: ["recorded", "ai-generated"] }),
  skillName: text("skill_name"),           // 关联的 Skill
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 执行历史表
export const executionHistory = pgTable("execution_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").references(() => tasks.id),
  workflowId: uuid("workflow_id").references(() => rpaWorkflows.id),
  status: varchar("status", { enum: ["success", "failed"] }),
  duration: integer("duration_ms"),
  result: jsonb("result"),
  executedAt: timestamp("executed_at").defaultNow(),
});

// 配置表
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### 4.10 API 路由

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/tasks` | 任务列表（分页、筛选） |
| POST | `/api/tasks` | 创建爬取任务 |
| GET | `/api/tasks/[taskId]` | 任务详情 |
| POST | `/api/tasks/[taskId]/cancel` | 取消任务 |
| GET | `/api/tasks/[taskId]/events` | SSE 实时推送 |
| GET | `/api/skills` | Skill 列表 |
| POST | `/api/skills/install` | 安装 Skill |
| DELETE | `/api/skills/[skillId]` | 卸载 Skill |
| POST | `/api/rpa/record` | 开始录制 |
| POST | `/api/rpa/stop` | 停止录制 → 生成 RPA |
| GET | `/api/rpa/workflows` | RPA 工作流列表 |
| POST | `/api/rpa/workflows/[id]/execute` | 执行 RPA 工作流 |
| GET | `/api/settings` | 获取配置 |
| PUT | `/api/settings` | 更新配置 |

---

## 5. 前端页面设计

### 5.1 首页 (`/`)

- Hero 区域：项目介绍 + 快速创建任务输入框
- 统计卡片：总任务数、成功率、平均耗时
- 最近任务列表（5 条）

### 5.2 创建任务 (`/tasks/create`)

- 自然语言输入框（大 Textarea）
- 输出格式选择（JSON/CSV/Excel）
- Skill 选择（可选，自动匹配）
- 高级选项（CDP 连接、浏览器模式、代理设置）
- 示例指令快速填充

### 5.3 任务详情 (`/tasks/[taskId]`)

- 状态卡片（当前状态 + 进度条）
- **Agent 可视化面板**（实时展示 Agent 的每一步操作）
  - 步骤时间线
  - 每步的输入/输出
  - 浏览器快照预览
- 结果数据预览（JSON 表格 / CSV 表格）
- 下载按钮

### 5.4 Agent 可视化组件

```tsx
// src/components/tasks/agent-visualizer.tsx
export function AgentVisualizer({ taskId }: { taskId: string }) {
  const { events } = useAgentEvents(taskId); // SSE 连接

  return (
    <div className="space-y-4">
      {events.map((event, i) => (
        <div key={i} className="flex items-start gap-3">
          <StepIcon type={event.type} />
          <div>
            <p className="font-medium">{event.title}</p>
            <p className="text-sm text-muted-foreground">{event.description}</p>
            {event.snapshot && <SnapshotPreview snapshot={event.snapshot} />}
            {event.toolCall && <ToolCallDisplay tool={event.toolCall} />}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDuration(event.duration)}
          </span>
        </div>
      ))}
    </div>
  );
}
```

### 5.5 Skill 市场 (`/skills`)

- 内置 Skill 列表
- 从 ClawHub 导入（输入 SKILL.md URL 或上传 zip）
- 每个 Skill 卡片：名称、描述、版本、作者、安装状态

### 5.6 设置 (`/settings`)

- LLM 配置（Provider、API Key、Model）
- 浏览器配置（Headless/Headed、CDP 端口、代理）
- 主题切换（Light/Dark/System）
- 语言切换（中文/English — 真正实现）

---

## 6. 数据导出

```typescript
// src/lib/export/exporter.ts
import { Parser } from "json2csv";
import * as XLSX from "xlsx";

export async function exportData(data: any[], format: "json" | "csv" | "excel") {
  switch (format) {
    case "json":
      return JSON.stringify(data, null, 2);

    case "csv":
      const parser = new Parser();
      return parser.parse(data);

    case "excel":
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  }
}
```

---

## 7. 测试策略

使用 Vitest，覆盖以下模块：

| 模块 | 测试内容 |
|------|---------|
| Agent 工具 | Mock MCP 客户端，测试工具调用 |
| Skill 加载 | 测试 OpenClaw SKILL.md 解析 |
| Skill 匹配 | 测试 URL 匹配逻辑 |
| 任务队列 | 测试任务创建、执行、失败重试 |
| API 路由 | 测试请求/响应 |
| 数据导出 | 测试 JSON/CSV/Excel 格式 |
| RPA 优化 | 测试 LLM 优化结果解析 |

---

## 8. 部署

### 开发环境

```bash
# 启动 Redis
docker run -d -p 6379:6379 redis

# 启动 Next.js
pnpm dev
```

### 生产环境

```yaml
# docker-compose.yml
services:
  web:
    build: .
    ports: ["3000:3000"]
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
      - LLM_API_KEY=...

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=ai_scraper
      - POSTGRES_PASSWORD=...
```

---

## 9. 里程碑

| 阶段 | 内容 | 估计时间 |
|------|------|---------|
| M1 | 项目脚手架 + 数据库 + API 基础 | 1-2 天 |
| M2 | Agent 引擎 + Playwright MCP 集成 | 2-3 天 |
| M3 | 前端页面 + SSE 实时推送 | 2-3 天 |
| M4 | Skill 系统 + 内置 Skills | 1-2 天 |
| M5 | 录制 → RPA 功能 | 2-3 天 |
| M6 | 测试 + 文档 + 部署 | 1-2 天 |

---

## 10. 风险与对策

| 风险 | 对策 |
|------|------|
| Playwright MCP 子进程崩溃 | 进程守护 + 自动重启 |
| LLM API 限流 | 重试 + 降级到备选 provider |
| 反爬网站 | CDP 连接真实浏览器 + 代理支持 |
| Skill 兼容性 | 沙箱执行 OpenClaw 脚本 |
| 长时间任务超时 | BullMQ 重试机制 + 用户可配置超时 |
