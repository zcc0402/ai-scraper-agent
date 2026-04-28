# AI Scraper Agent 全栈重构实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有的 Python AI Scraper Agent 全栈重构为 TypeScript，基于 Next.js 16 + pi-mono + Playwright MCP + BullMQ 的生产级架构。

**架构:** 单体 Next.js App Router 项目，内置 Playwright MCP 子进程实现自然语言浏览器交互，pi-agent-core 驱动 Agent 循环，BullMQ + Redis 处理后台任务，SSE 实时推送 Agent 执行进度。

**Tech Stack:** Next.js 16, Tailwind v4, shadcn/ui, @mariozechner/pi-agent-core, @mariozechner/pi-ai, Playwright MCP, BullMQ, Drizzle ORM, PostgreSQL, Vitest

**Spec:** `docs/superpowers/specs/2026-04-29-ai-scraper-redesign-design.md`

---

## Task 1: 项目脚手架搭建

**目标:** 创建 Next.js 16 项目，配置 Tailwind v4、shadcn/ui、Vitest、ESLint。

**Files:**
- Create: `web/` (新项目根目录)
- Create: `web/package.json`
- Create: `web/tsconfig.json`
- Create: `web/next.config.ts`
- Create: `web/vitest.config.ts`
- Create: `web/src/app/layout.tsx`
- Create: `web/src/app/page.tsx`
- Create: `web/src/app/globals.css`
- Create: `web/.env.example`
- Create: `web/.gitignore`

- [ ] **Step 1: 创建 Next.js 16 项目**

```bash
cd /Users/yuwang/code/ai
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd web
```

- [ ] **Step 2: 安装核心依赖**

```bash
cd /Users/yuwang/code/ai/web
pnpm add @mariozechner/pi-agent-core @mariozechner/pi-ai
pnpm add @modelcontextprotocol/sdk playwright @playwright/mcp
pnpm add bullmq ioredis
pnpm add drizzle-orm pg
pnpm add next-intl
pnpm add gray-matter json2csv xlsx
pnpm add zustand axios
pnpm add -D @types/pg @types/json2csv vitest @vitejs/plugin-react
pnpm add -D drizzle-kit
```

- [ ] **Step 3: 初始化 shadcn/ui**

```bash
cd /Users/yuwang/code/ai/web
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card input label select textarea badge dialog tabs switch toast
```

- [ ] **Step 4: 配置 Vitest**

创建 `web/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
```

- [ ] **Step 5: 配置环境变量**

创建 `web/.env.example`:

```bash
# LLM
LLM_PROVIDER=google
LLM_MODEL=gemini-2.5-flash
LLM_API_KEY=
LLM_BASE_URL=

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_scraper

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 6: 更新 package.json scripts**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

- [ ] **Step 7: 提交**

```bash
cd /Users/yuwang/code/ai
git add web/
git commit -m "feat: 初始化 Next.js 16 项目脚手架"
```

---

## Task 2: 数据库 Schema + Drizzle 配置

**目标:** 定义所有数据库表结构，配置 Drizzle ORM 连接 PostgreSQL。

**Files:**
- Create: `web/src/lib/db/index.ts`
- Create: `web/src/lib/db/schema.ts`
- Create: `web/drizzle.config.ts`

- [ ] **Step 1: 定义数据库 Schema**

创建 `web/src/lib/db/schema.ts`:

```typescript
import {
  pgTable, text, timestamp, jsonb, integer,
  uuid, varchar,
} from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userInput: text("user_input").notNull(),
  skillName: text("skill_name"),
  status: varchar("status", {
    enum: [
      "pending", "running", "planning", "navigating",
      "extracting", "validating", "exporting",
      "completed", "failed", "cancelled",
    ],
  }).default("pending"),
  progress: integer("progress").default(0),
  resultData: jsonb("result_data"),
  outputFile: text("output_file"),
  outputFormat: varchar("output_format", {
    enum: ["json", "csv", "excel"],
  }).default("json"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  version: text("version").notNull(),
  type: varchar("type", { enum: ["native", "openclaw"] }).notNull(),
  source: text("source"),
  config: jsonb("config"),
  installedAt: timestamp("installed_at").defaultNow(),
});

export const rpaWorkflows = pgTable("rpa_workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  steps: jsonb("steps").notNull(),
  source: varchar("source", { enum: ["recorded", "ai-generated"] }),
  skillName: text("skill_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const executionHistory = pgTable("execution_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").references(() => tasks.id),
  workflowId: uuid("workflow_id").references(() => rpaWorkflows.id),
  status: varchar("status", { enum: ["success", "failed"] }),
  duration: integer("duration_ms"),
  result: jsonb("result"),
  executedAt: timestamp("executed_at").defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

- [ ] **Step 2: 创建 Drizzle 实例**

创建 `web/src/lib/db/index.ts`:

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
```

- [ ] **Step 3: 配置 Drizzle Kit**

创建 `web/drizzle.config.ts`:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 4: 生成迁移文件**

```bash
cd /Users/yuwang/code/ai/web
pnpm db:generate
```

- [ ] **Step 5: 提交**

```bash
cd /Users/yuwang/code/ai
git add web/src/lib/db/ web/drizzle.config.ts web/drizzle/
git commit -m "feat: 添加数据库 Schema 和 Drizzle 配置"
```

---

## Task 3: LLM Provider + Playwright MCP 客户端

**目标:** 封装 pi-ai 统一 LLM API，实现 Playwright MCP 子进程客户端。

**Files:**
- Create: `web/src/lib/llm/provider.ts`
- Create: `web/src/lib/browser/mcp-client.ts`
- Create: `web/src/lib/browser/connector.ts`
- Create: `web/src/lib/browser/extractor.ts`
- Test: `web/tests/llm/provider.test.ts`
- Test: `web/tests/browser/mcp-client.test.ts`

- [ ] **Step 1: 写 LLM Provider 测试**

创建 `web/tests/llm/provider.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";

describe("LLM Provider", () => {
  it("should export getLLMModel function", async () => {
    const mod = await import("@/lib/llm/provider");
    expect(typeof mod.getLLMModel).toBe("function");
  });

  it("should export streamCompletion function", async () => {
    const mod = await import("@/lib/llm/provider");
    expect(typeof mod.streamCompletion).toBe("function");
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd /Users/yuwang/code/ai/web
pnpm test -- --run tests/llm/provider.test.ts
```

Expected: FAIL — 模块不存在

- [ ] **Step 3: 实现 LLM Provider**

创建 `web/src/lib/llm/provider.ts`:

```typescript
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
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd /Users/yuwang/code/ai/web
pnpm test -- --run tests/llm/provider.test.ts
```

Expected: PASS

- [ ] **Step 5: 写 MCP Client 测试**

创建 `web/tests/browser/mcp-client.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

describe("Playwright MCP Client", () => {
  it("should export mcpClient singleton", async () => {
    const mod = await import("@/lib/browser/mcp-client");
    expect(mod.mcpClient).toBeDefined();
    expect(typeof mod.mcpClient.connect).toBe("function");
    expect(typeof mod.mcpClient.callTool).toBe("function");
    expect(typeof mod.mcpClient.disconnect).toBe("function");
  });
});
```

- [ ] **Step 6: 运行测试确认失败**

```bash
cd /Users/yuwang/code/ai/web
pnpm test -- --run tests/browser/mcp-client.test.ts
```

Expected: FAIL

- [ ] **Step 7: 实现 MCP Client**

创建 `web/src/lib/browser/mcp-client.ts`:

```typescript
import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio";

class PlaywrightMCPClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private connecting = false;

  async connect() {
    if (this.client || this.connecting) return;
    this.connecting = true;

    try {
      this.transport = new StdioClientTransport({
        command: "npx",
        args: ["@playwright/mcp@latest", "--headless", "--isolated"],
      });

      this.client = new Client({ name: "ai-scraper", version: "1.0.0" });
      await this.client.connect(this.transport);
    } finally {
      this.connecting = false;
    }
  }

  async callTool(name: string, args?: Record<string, unknown>) {
    if (!this.client) await this.connect();
    return this.client!.callTool({ name, arguments: args });
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.transport = null;
    }
  }
}

export const mcpClient = new PlaywrightMCPClient();
```

- [ ] **Step 8: 实现浏览器连接器（CDP 兜底）**

创建 `web/src/lib/browser/connector.ts`:

```typescript
import { chromium, type Browser } from "playwright";

export interface BrowserOptions {
  mode: "managed" | "cdp";
  cdpEndpoint?: string;
  headless?: boolean;
}

export async function connectBrowser(options: BrowserOptions): Promise<Browser> {
  if (options.mode === "cdp" && options.cdpEndpoint) {
    return chromium.connectOverCDP(options.cdpEndpoint);
  }
  return chromium.launch({ headless: options.headless ?? true });
}
```

- [ ] **Step 9: 实现批量数据提取器**

创建 `web/src/lib/browser/extractor.ts`:

```typescript
import { type Page } from "playwright";

export async function extractText(page: Page, selector: string): Promise<string[]> {
  return page.locator(selector).allTextContents();
}

export async function extractTable(page: Page, selector: string): Promise<Record<string, string>[]> {
  const rows = await page.locator(`${selector} tr`).all();
  const headers = await rows[0]?.locator("th").allTextContents() || [];
  const data: Record<string, string>[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cells = await rows[i].locator("td").allTextContents();
    const row: Record<string, string> = {};
    headers.forEach((h, j) => { row[h] = cells[j] || ""; });
    data.push(row);
  }

  return data;
}
```

- [ ] **Step 10: 运行全部测试**

```bash
cd /Users/yuwang/code/ai/web
pnpm test
```

Expected: 全部 PASS

- [ ] **Step 11: 提交**

```bash
cd /Users/yuwang/code/ai
git add web/src/lib/llm/ web/src/lib/browser/ web/tests/
git commit -m "feat: 添加 LLM Provider 和 Playwright MCP 客户端"
```

---

## Task 4: Skill 系统

**目标:** 实现可扩展的 Skill 注册表，支持原生 TS Skill 和 OpenClaw SKILL.md 格式。

**Files:**
- Create: `web/src/lib/skills/types.ts`
- Create: `web/src/lib/skills/loader.ts`
- Create: `web/src/lib/skills/registry.ts`
- Create: `web/skills/generic/index.ts`
- Test: `web/tests/skills/registry.test.ts`
- Test: `web/tests/skills/loader.test.ts`

- [ ] **Step 1: 写 Skill 注册表测试**

创建 `web/tests/skills/registry.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";

describe("SkillRegistry", () => {
  it("should register and match skills", async () => {
    const { SkillRegistry } = await import("@/lib/skills/registry");
    const registry = new SkillRegistry();

    const skill = {
      name: "test",
      displayName: "Test",
      description: "Test skill",
      version: "1.0.0",
      type: "native" as const,
      match: (url: string) => url.includes("example.com"),
      tools: [],
      systemPrompt: "test",
    };

    registry.register(skill);
    expect(registry.match("https://example.com")).toBe(skill);
  });

  it("should fallback to generic skill", async () => {
    const { SkillRegistry } = await import("@/lib/skills/registry");
    const registry = new SkillRegistry();

    const generic = {
      name: "generic",
      displayName: "Generic",
      description: "Generic skill",
      version: "1.0.0",
      type: "native" as const,
      match: () => true,
      tools: [],
      systemPrompt: "generic",
    };

    registry.register(generic);
    expect(registry.match("https://unknown.com")).toBe(generic);
  });

  it("should list all skills", async () => {
    const { SkillRegistry } = await import("@/lib/skills/registry");
    const registry = new SkillRegistry();

    registry.register({
      name: "a", displayName: "A", description: "", version: "1.0.0",
      type: "native", match: () => false, tools: [], systemPrompt: "",
    });
    registry.register({
      name: "b", displayName: "B", description: "", version: "1.0.0",
      type: "native", match: () => false, tools: [], systemPrompt: "",
    });

    expect(registry.list()).toHaveLength(2);
  });
});
```

- [ ] **Step 2: 写 OpenClaw 加载器测试**

创建 `web/tests/skills/loader.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";

describe("OpenClaw Skill Loader", () => {
  const tmpDir = join(__dirname, "__tmp_skill__");

  it("should parse SKILL.md frontmatter", async () => {
    mkdirSync(join(tmpDir, "scripts"), { recursive: true });
    writeFileSync(join(tmpDir, "SKILL.md"), `---
name: test-scraper
description: A test scraper
---
# Test Scraper
This is a test.`);
    writeFileSync(join(tmpDir, "scripts", "scrape.py"), "print('hello')");

    const { loadOpenClawSkill } = await import("@/lib/skills/loader");
    const skill = await loadOpenClawSkill(tmpDir);

    expect(skill.name).toBe("test-scraper");
    expect(skill.description).toBe("A test scraper");
    expect(skill.type).toBe("openclaw");
    expect(skill.scripts).toHaveLength(1);

    rmSync(tmpDir, { recursive: true });
  });
});
```

- [ ] **Step 3: 运行测试确认失败**

```bash
cd /Users/yuwang/code/ai/web
pnpm test -- --run tests/skills/
```

Expected: FAIL

- [ ] **Step 4: 实现 Skill 类型定义**

创建 `web/src/lib/skills/types.ts`:

```typescript
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
```

- [ ] **Step 5: 实现 OpenClaw 加载器**

创建 `web/src/lib/skills/loader.ts`:

```typescript
import matter from "gray-matter";
import { readFile, readdir } from "fs/promises";
import { join, basename, extname } from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import type { Skill } from "./types";

const execFileAsync = promisify(execFile);

export async function loadOpenClawSkill(skillDir: string): Promise<Skill> {
  const content = await readFile(join(skillDir, "SKILL.md"), "utf-8");
  const { data, body } = matter(content);

  const scriptsDir = join(skillDir, "scripts");
  let scripts: string[] = [];
  try {
    const files = await readdir(scriptsDir);
    scripts = files
      .filter((f) => /\.(py|ts|js)$/.test(f))
      .map((f) => join(scriptsDir, f));
  } catch {
    // scripts 目录不存在
  }

  return {
    name: data.name,
    displayName: data.name,
    description: data.description || "",
    version: data.version || "1.0.0",
    type: "openclaw",
    match: () => true,
    tools: scripts.map((script) => ({
      name: `run_${basename(script, extname(script))}`,
      description: `Run ${basename(script)}`,
      execute: async (args: Record<string, unknown>) => {
        const { stdout } = await execFileAsync(script, Object.values(args).map(String));
        return stdout;
      },
    })),
    systemPrompt: body,
    scripts,
  };
}

export async function loadNativeSkill(path: string): Promise<Skill> {
  const mod = await import(path);
  return mod.default;
}
```

- [ ] **Step 6: 实现 Skill 注册表**

创建 `web/src/lib/skills/registry.ts`:

```typescript
import type { Skill } from "./types";

export class SkillRegistry {
  private skills = new Map<string, Skill>();

  register(skill: Skill) {
    this.skills.set(skill.name, skill);
  }

  match(urlOrQuery: string): Skill {
    for (const skill of this.skills.values()) {
      if (skill.match(urlOrQuery)) return skill;
    }
    return this.skills.get("generic")!;
  }

  list(): Skill[] {
    return [...this.skills.values()];
  }

  get(name: string): Skill | undefined {
    return this.skills.get(name);
  }
}

export const skillRegistry = new SkillRegistry();
```

- [ ] **Step 7: 创建通用 Skill**

创建 `web/skills/generic/index.ts`:

```typescript
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
```

- [ ] **Step 8: 运行测试确认通过**

```bash
cd /Users/yuwang/code/ai/web
pnpm test -- --run tests/skills/
```

Expected: 全部 PASS

- [ ] **Step 9: 提交**

```bash
cd /Users/yuwang/code/ai
git add web/src/lib/skills/ web/skills/ web/tests/skills/
git commit -m "feat: 添加 Skill 系统（注册表 + OpenClaw 加载器）"
```

---

## Task 5: Agent 引擎

**目标:** 基于 pi-agent-core 实现爬虫 Agent，定义浏览器工具集。

**Files:**
- Create: `web/src/lib/agent/factory.ts`
- Create: `web/src/lib/agent/tools.ts`
- Create: `web/src/lib/agent/prompts.ts`
- Create: `web/src/lib/export/exporter.ts`
- Test: `web/tests/agent/tools.test.ts`
- Test: `web/tests/export/exporter.test.ts`

- [ ] **Step 1: 写浏览器工具测试**

创建 `web/tests/agent/tools.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/browser/mcp-client", () => ({
  mcpClient: {
    callTool: vi.fn().mockResolvedValue({ content: "mocked" }),
  },
}));

describe("Browser Tools", () => {
  it("should return array of tools with required fields", async () => {
    const { createBrowserTools } = await import("@/lib/agent/tools");
    const tools = createBrowserTools();

    expect(tools.length).toBeGreaterThan(0);
    for (const tool of tools) {
      expect(tool).toHaveProperty("name");
      expect(tool).toHaveProperty("description");
      expect(tool).toHaveProperty("execute");
      expect(typeof tool.execute).toBe("function");
    }
  });

  it("should include navigate tool", async () => {
    const { createBrowserTools } = await import("@/lib/agent/tools");
    const tools = createBrowserTools();
    const navigate = tools.find((t) => t.name === "navigate");
    expect(navigate).toBeDefined();
  });

  it("should include snapshot tool", async () => {
    const { createBrowserTools } = await import("@/lib/agent/tools");
    const tools = createBrowserTools();
    const snapshot = tools.find((t) => t.name === "snapshot");
    expect(snapshot).toBeDefined();
  });
});
```

- [ ] **Step 2: 写导出工具测试**

创建 `web/tests/export/exporter.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

describe("Data Exporter", () => {
  const sampleData = [
    { title: "Item 1", url: "https://a.com" },
    { title: "Item 2", url: "https://b.com" },
  ];

  it("should export as JSON", async () => {
    const { exportData } = await import("@/lib/export/exporter");
    const result = await exportData(sampleData, "json");
    const parsed = JSON.parse(result as string);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].title).toBe("Item 1");
  });

  it("should export as CSV", async () => {
    const { exportData } = await import("@/lib/export/exporter");
    const result = await exportData(sampleData, "csv");
    expect(result).toContain("title");
    expect(result).toContain("Item 1");
  });
});
```

- [ ] **Step 3: 运行测试确认失败**

```bash
cd /Users/yuwang/code/ai/web
pnpm test -- --run tests/agent/ tests/export/
```

Expected: FAIL

- [ ] **Step 4: 实现系统提示词**

创建 `web/src/lib/agent/prompts.ts`:

```typescript
export const SCRAPER_SYSTEM_PROMPT = `你是一个智能网页数据提取助手。你的任务是帮助用户从网页中提取结构化数据。

## 工作流程
1. 分析用户意图，确定目标 URL 和需要提取的数据字段
2. 使用 navigate 工具访问目标页面
3. 使用 snapshot 工具获取页面无障碍树，理解页面结构
4. 根据需要使用 click/scroll/fill 等工具与页面交互
5. 使用 extract_text 工具提取数据
6. 将结果整理为结构化的 JSON 格式

## 输出规范
- 最终输出必须是 JSON 数组，每个元素是一条数据记录
- 字段名使用英文 camelCase
- 如果数据不完整，标注 null 而非跳过

## 注意事项
- 如果页面需要滚动加载更多内容，使用 scroll 工具
- 如果遇到弹窗或遮罩，先关闭再继续
- 每次操作后使用 snapshot 确认页面状态`;
```

- [ ] **Step 5: 实现浏览器工具**

创建 `web/src/lib/agent/tools.ts`:

```typescript
import { mcpClient } from "@/lib/browser/mcp-client";
import type { AgentTool } from "@/lib/skills/types";

export function createBrowserTools(): AgentTool[] {
  return [
    {
      name: "navigate",
      description: "Navigate browser to a URL",
      parameters: { url: "string" },
      execute: async ({ url }) => {
        return mcpClient.callTool("browser_navigate", { url: String(url) });
      },
    },
    {
      name: "snapshot",
      description: "Get accessibility tree snapshot of the current page",
      execute: async () => {
        return mcpClient.callTool("browser_snapshot");
      },
    },
    {
      name: "click",
      description: "Click an element by its ref ID from snapshot",
      parameters: { ref: "string" },
      execute: async ({ ref }) => {
        return mcpClient.callTool("browser_click", { uid: String(ref) });
      },
    },
    {
      name: "fill",
      description: "Fill an input field by its ref ID",
      parameters: { ref: "string", value: "string" },
      execute: async ({ ref, value }) => {
        return mcpClient.callTool("browser_fill", {
          uid: String(ref),
          value: String(value),
        });
      },
    },
    {
      name: "scroll",
      description: "Scroll the page up or down",
      parameters: { direction: "string" },
      execute: async ({ direction }) => {
        return mcpClient.callTool("browser_scroll", {
          direction: String(direction),
        });
      },
    },
    {
      name: "screenshot",
      description: "Take a screenshot of the current page",
      execute: async () => {
        return mcpClient.callTool("browser_screenshot");
      },
    },
    {
      name: "wait_for",
      description: "Wait for text to appear on the page",
      parameters: { text: "string", timeout: "number" },
      execute: async ({ text, timeout }) => {
        return mcpClient.callTool("browser_wait_for", {
          text: [String(text)],
          timeout: Number(timeout) || 10000,
        });
      },
    },
  ];
}
```

- [ ] **Step 6: 实现数据导出**

创建 `web/src/lib/export/exporter.ts`:

```typescript
import { Parser } from "json2csv";

export async function exportData(
  data: Record<string, unknown>[],
  format: "json" | "csv" | "excel"
): Promise<string | Buffer> {
  switch (format) {
    case "json":
      return JSON.stringify(data, null, 2);

    case "csv": {
      if (data.length === 0) return "";
      const parser = new Parser({ fields: Object.keys(data[0]) });
      return parser.parse(data);
    }

    case "excel": {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    }

    default:
      return JSON.stringify(data, null, 2);
  }
}
```

- [ ] **Step 7: 实现 Agent 工厂**

创建 `web/src/lib/agent/factory.ts`:

```typescript
import { Agent } from "@mariozechner/pi-agent-core";
import { getLLMModel } from "@/lib/llm/provider";
import { createBrowserTools } from "./tools";
import { SCRAPER_SYSTEM_PROMPT } from "./prompts";
import type { Skill } from "@/lib/skills/types";

export interface AgentEvent {
  type: string;
  title?: string;
  description?: string;
  snapshot?: string;
  toolCall?: { name: string; args: Record<string, unknown> };
  duration?: number;
  [key: string]: unknown;
}

export function createScraperAgent(
  skill: Skill,
  onEvent?: (event: AgentEvent) => void
) {
  const tools = [...createBrowserTools(), ...skill.tools];

  const agent = new Agent({
    initialState: {
      systemPrompt: skill.systemPrompt || SCRAPER_SYSTEM_PROMPT,
      model: getLLMModel(),
      tools,
      messages: [],
    },
  });

  if (onEvent) {
    agent.subscribe((event: unknown) => {
      onEvent(event as AgentEvent);
    });
  }

  return agent;
}
```

- [ ] **Step 8: 运行测试确认通过**

```bash
cd /Users/yuwang/code/ai/web
pnpm test -- --run tests/agent/ tests/export/
```

Expected: 全部 PASS

- [ ] **Step 9: 提交**

```bash
cd /Users/yuwang/code/ai
git add web/src/lib/agent/ web/src/lib/export/ web/tests/agent/ web/tests/export/
git commit -m "feat: 添加 Agent 引擎（工厂 + 工具 + 导出）"
```

---

## Task 6: BullMQ 任务队列 + SSE 事件系统

**目标:** 实现后台任务执行和实时事件推送。

**Files:**
- Create: `web/src/lib/queue/producer.ts`
- Create: `web/src/lib/queue/worker.ts`
- Create: `web/src/lib/queue/events.ts`
- Create: `web/src/app/api/tasks/[taskId]/events/route.ts`
- Test: `web/tests/queue/events.test.ts`

- [ ] **Step 1: 写事件系统测试**

创建 `web/tests/queue/events.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

describe("Event System", () => {
  it("should publish and subscribe to events", async () => {
    const { TaskEventBus } = await import("@/lib/queue/events");
    const bus = new TaskEventBus();

    const received: unknown[] = [];
    bus.subscribe("task-1", (event) => received.push(event));

    bus.publish("task-1", { type: "status", status: "running" });
    bus.publish("task-1", { type: "completed" });

    expect(received).toHaveLength(2);
    expect(received[0]).toEqual({ type: "status", status: "running" });
  });

  it("should not receive events for other tasks", async () => {
    const { TaskEventBus } = await import("@/lib/queue/events");
    const bus = new TaskEventBus();

    const received: unknown[] = [];
    bus.subscribe("task-1", (event) => received.push(event));
    bus.publish("task-2", { type: "status" });

    expect(received).toHaveLength(0);
  });

  it("should unsubscribe correctly", async () => {
    const { TaskEventBus } = await import("@/lib/queue/events");
    const bus = new TaskEventBus();

    const received: unknown[] = [];
    const unsub = bus.subscribe("task-1", (event) => received.push(event));
    bus.publish("task-1", { type: "a" });
    unsub();
    bus.publish("task-1", { type: "b" });

    expect(received).toHaveLength(1);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd /Users/yuwang/code/ai/web
pnpm test -- --run tests/queue/
```

Expected: FAIL

- [ ] **Step 3: 实现事件总线**

创建 `web/src/lib/queue/events.ts`:

```typescript
export type TaskEvent = {
  type: string;
  [key: string]: unknown;
};

type Listener = (event: TaskEvent) => void;

export class TaskEventBus {
  private listeners = new Map<string, Set<Listener>>();

  subscribe(taskId: string, listener: Listener): () => void {
    if (!this.listeners.has(taskId)) {
      this.listeners.set(taskId, new Set());
    }
    this.listeners.get(taskId)!.add(listener);

    return () => {
      this.listeners.get(taskId)?.delete(listener);
    };
  }

  publish(taskId: string, event: TaskEvent): void {
    const listeners = this.listeners.get(taskId);
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }
}

export const taskEvents = new TaskEventBus();
```

- [ ] **Step 4: 实现任务生产者**

创建 `web/src/lib/queue/producer.ts`:

```typescript
import { Queue } from "bullmq";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
};

export const scrapeQueue = new Queue("scrape", { connection });

export async function addScrapeJob(params: {
  taskId: string;
  userInput: string;
  skillName?: string;
  outputFormat?: string;
}) {
  return scrapeQueue.add("scrape", params, {
    attempts: 2,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { age: 86400 },
    removeOnFail: { age: 604800 },
  });
}
```

- [ ] **Step 5: 实现任务 Worker**

创建 `web/src/lib/queue/worker.ts`:

```typescript
import { Worker } from "bullmq";
import { createScraperAgent } from "@/lib/agent/factory";
import { skillRegistry } from "@/lib/skills/registry";
import { taskEvents } from "./events";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { exportData } from "@/lib/export/exporter";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
};

export function startWorker() {
  const worker = new Worker(
    "scrape",
    async (job) => {
      const { taskId, userInput, skillName, outputFormat } = job.data;

      const skill = skillRegistry.match(userInput);

      await db.update(tasks).set({ status: "running" }).where(eq(tasks.id, taskId));
      taskEvents.publish(taskId, { type: "status", status: "running" });

      const agent = createScraperAgent(skill, (event) => {
        taskEvents.publish(taskId, event);

        const statusMap: Record<string, string> = {
          turn_start: "planning",
          tool_execution_start: "navigating",
          tool_execution_end: "extracting",
        };
        if (statusMap[event.type]) {
          db.update(tasks)
            .set({ status: statusMap[event.type] as any })
            .where(eq(tasks.id, taskId));
        }
      });

      const result = await agent.prompt(userInput);

      taskEvents.publish(taskId, { type: "status", status: "exporting" });
      const file = await exportData(
        Array.isArray(result) ? result : [result],
        (outputFormat as any) || "json"
      );

      await db.update(tasks)
        .set({
          status: "completed",
          resultData: result,
          outputFile: typeof file === "string" ? file : undefined,
          completedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));

      taskEvents.publish(taskId, { type: "completed", result });
      return { result };
    },
    { connection }
  );

  worker.on("failed", async (job, err) => {
    if (job) {
      await db.update(tasks)
        .set({ status: "failed", errorMessage: err.message })
        .where(eq(tasks.id, job.data.taskId));
      taskEvents.publish(job.data.taskId, { type: "failed", error: err.message });
    }
  });

  return worker;
}
```

- [ ] **Step 6: 实现 SSE 推送端点**

创建 `web/src/app/api/tasks/[taskId]/events/route.ts`:

```typescript
import { taskEvents } from "@/lib/queue/events";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const unsubscribe = taskEvents.subscribe(taskId, (event) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      });

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"));
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

- [ ] **Step 7: 运行测试确认通过**

```bash
cd /Users/yuwang/code/ai/web
pnpm test -- --run tests/queue/
```

Expected: 全部 PASS

- [ ] **Step 8: 提交**

```bash
cd /Users/yuwang/code/ai
git add web/src/lib/queue/ web/src/app/api/tasks/\[taskId\]/events/ web/tests/queue/
git commit -m "feat: 添加 BullMQ 任务队列和 SSE 事件系统"
```

---

## Task 7: API 路由

**目标:** 实现所有 REST API 端点。

**Files:**
- Create: `web/src/app/api/tasks/route.ts`
- Create: `web/src/app/api/tasks/[taskId]/route.ts`
- Create: `web/src/app/api/tasks/[taskId]/cancel/route.ts`
- Create: `web/src/app/api/skills/route.ts`
- Create: `web/src/app/api/settings/route.ts`
- Test: `web/tests/api/tasks.test.ts`

- [ ] **Step 1: 写 Tasks API 测试**

创建 `web/tests/api/tasks.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{
          id: "test-id",
          userInput: "test",
          status: "pending",
          createdAt: new Date(),
        }]),
      }),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            offset: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}));

vi.mock("@/lib/queue/producer", () => ({
  addScrapeJob: vi.fn().mockResolvedValue({ id: "job-1" }),
}));

describe("Tasks API", () => {
  it("POST /api/tasks should create a task", async () => {
    const { POST } = await import("@/app/api/tasks/route");
    const req = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        userInput: "抓取 Hacker News 前10条标题",
        outputFormat: "json",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd /Users/yuwang/code/ai/web
pnpm test -- --run tests/api/
```

Expected: FAIL

- [ ] **Step 3: 实现 Tasks API**

创建 `web/src/app/api/tasks/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { addScrapeJob } from "@/lib/queue/producer";
import { desc, eq, sql } from "drizzle-orm";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit")) || 20;
  const offset = Number(url.searchParams.get("offset")) || 0;
  const status = url.searchParams.get("status");

  let query = db.select().from(tasks).orderBy(desc(tasks.createdAt));

  if (status) {
    query = query.where(eq(tasks.status, status as any)) as typeof query;
  }

  const result = await query.limit(limit).offset(offset);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { userInput, outputFormat, skillName } = body;

  if (!userInput || typeof userInput !== "string") {
    return NextResponse.json({ error: "userInput is required" }, { status: 400 });
  }

  const [task] = await db
    .insert(tasks)
    .values({
      userInput,
      outputFormat: outputFormat || "json",
      skillName: skillName || null,
      status: "pending",
    })
    .returning();

  await addScrapeJob({
    taskId: task.id,
    userInput,
    skillName,
    outputFormat: outputFormat || "json",
  });

  return NextResponse.json(task);
}
```

- [ ] **Step 4: 实现 Task 详情 API**

创建 `web/src/app/api/tasks/[taskId]/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  const [task] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId));

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}
```

- [ ] **Step 5: 实现取消任务 API**

创建 `web/src/app/api/tasks/[taskId]/cancel/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { taskEvents } from "@/lib/queue/events";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  await db.update(tasks)
    .set({ status: "cancelled" })
    .where(eq(tasks.id, taskId));

  taskEvents.publish(taskId, { type: "cancelled" });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 6: 实现 Skills API**

创建 `web/src/app/api/skills/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { skillRegistry } from "@/lib/skills/registry";

export async function GET() {
  const skills = skillRegistry.list().map((s) => ({
    name: s.name,
    displayName: s.displayName,
    description: s.description,
    version: s.version,
    type: s.type,
  }));
  return NextResponse.json(skills);
}
```

- [ ] **Step 7: 实现 Settings API**

创建 `web/src/app/api/settings/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const all = await db.select().from(settings);
  const map: Record<string, unknown> = {};
  for (const s of all) {
    map[s.key] = s.value;
  }
  return NextResponse.json(map);
}

export async function PUT(req: Request) {
  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() },
      });
  }
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 8: 运行测试确认通过**

```bash
cd /Users/yuwang/code/ai/web
pnpm test -- --run tests/api/
```

Expected: 全部 PASS

- [ ] **Step 9: 提交**

```bash
cd /Users/yuwang/code/ai
git add web/src/app/api/ web/tests/api/
git commit -m "feat: 添加 API 路由（Tasks, Skills, Settings）"
```

---

## Task 8: 前端页面 — 首页 + 任务管理

**目标:** 实现首页、任务列表、创建任务、任务详情页面。

**Files:**
- Modify: `web/src/app/layout.tsx`
- Modify: `web/src/app/page.tsx`
- Create: `web/src/components/layout/navbar.tsx`
- Create: `web/src/components/tasks/task-card.tsx`
- Create: `web/src/components/tasks/task-form.tsx`
- Create: `web/src/app/tasks/page.tsx`
- Create: `web/src/app/tasks/create/page.tsx`
- Create: `web/src/app/tasks/[taskId]/page.tsx`
- Create: `web/src/hooks/use-sse.ts`
- Create: `web/src/hooks/use-agent-events.ts`

- [ ] **Step 1: 创建导航栏组件**

创建 `web/src/components/layout/navbar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "首页" },
  { href: "/tasks", label: "任务" },
  { href: "/tasks/create", label: "创建任务" },
  { href: "/skills", label: "Skills" },
  { href: "/settings", label: "设置" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 font-bold text-lg">
          AI Scraper
        </Link>
        <div className="flex gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: 更新根布局**

修改 `web/src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Scraper Agent",
  description: "自然语言驱动的智能爬虫",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Navbar />
        <main className="container py-6">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: 创建任务卡片组件**

创建 `web/src/components/tasks/task-card.tsx`:

```tsx
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  running: "bg-blue-100 text-blue-800",
  planning: "bg-blue-100 text-blue-800",
  navigating: "bg-blue-100 text-blue-800",
  extracting: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

interface TaskCardProps {
  task: {
    id: string;
    userInput: string;
    status: string;
    createdAt: string;
    completedAt?: string | null;
  };
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Link href={`/tasks/${task.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium truncate max-w-[70%]">
              {task.userInput}
            </CardTitle>
            <Badge className={statusColors[task.status] || ""}>
              {task.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {new Date(task.createdAt).toLocaleString("zh-CN")}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 4: 创建任务表单组件**

创建 `web/src/components/tasks/task-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const examples = [
  "抓取 Hacker News 前10条标题",
  "提取淘宝搜索 '机械键盘' 前20个商品名称和价格",
  "抓取 GitHub Trending 今日热门项目",
];

export function TaskForm() {
  const router = useRouter();
  const [userInput, setUserInput] = useState("");
  const [outputFormat, setOutputFormat] = useState("json");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userInput.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput, outputFormat }),
      });
      const task = await res.json();
      router.push(`/tasks/${task.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="userInput">描述你想抓取的数据</Label>
        <Textarea
          id="userInput"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="例如：抓取 Hacker News 前10条标题"
          rows={4}
          className="mt-2"
        />
        <div className="flex gap-2 mt-2">
          {examples.map((ex) => (
            <Button
              key={ex}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUserInput(ex)}
            >
              {ex.slice(0, 20)}...
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label>输出格式</Label>
        <Select value={outputFormat} onValueChange={setOutputFormat}>
          <SelectTrigger className="mt-2 w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="excel">Excel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading || !userInput.trim()}>
        {loading ? "创建中..." : "开始爬取"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 5: 创建首页**

修改 `web/src/app/page.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">AI Scraper Agent</h1>
        <p className="text-xl text-muted-foreground mb-8">
          用自然语言描述你想抓取的数据，AI 自动完成爬取
        </p>
        <Link href="/tasks/create">
          <Button size="lg">开始爬取</Button>
        </Link>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>自然语言驱动</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              无需编写代码或选择器，用自然语言描述需求即可
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>多角色 AI 协作</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              规划、导航、提取、验证，智能分工协作
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>可扩展 Skill 系统</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              支持 OpenClaw 技能，一键安装扩展爬虫能力
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
```

- [ ] **Step 6: 创建 SSE Hook**

创建 `web/src/hooks/use-sse.ts`:

```tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function useSSE<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!url) return;

    const source = new EventSource(url);
    sourceRef.current = source;

    source.onopen = () => setConnected(true);
    source.onmessage = (e) => {
      try {
        setData(JSON.parse(e.data));
      } catch {
        // heartbeat or non-JSON
      }
    };
    source.onerror = () => {
      setError("Connection lost");
      setConnected(false);
    };

    return () => {
      source.close();
      sourceRef.current = null;
    };
  }, [url]);

  return { data, error, connected };
}
```

- [ ] **Step 7: 创建 Agent 事件 Hook**

创建 `web/src/hooks/use-agent-events.ts`:

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";

export interface AgentEvent {
  type: string;
  title?: string;
  description?: string;
  snapshot?: string;
  toolCall?: { name: string; args: Record<string, unknown> };
  status?: string;
  result?: unknown;
  [key: string]: unknown;
}

export function useAgentEvents(taskId: string) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [taskStatus, setTaskStatus] = useState<string>("pending");

  useEffect(() => {
    const source = new EventSource(`/api/tasks/${taskId}/events`);

    source.onmessage = (e) => {
      try {
        const event: AgentEvent = JSON.parse(e.data);
        setEvents((prev) => [...prev, event]);

        if (event.type === "status" && event.status) {
          setTaskStatus(event.status as string);
        }
        if (event.type === "completed" || event.type === "failed") {
          setTaskStatus(event.type);
        }
      } catch {
        // heartbeat
      }
    };

    source.onerror = () => {
      source.close();
    };

    return () => source.close();
  }, [taskId]);

  return { events, taskStatus };
}
```

- [ ] **Step 8: 创建任务列表页**

创建 `web/src/app/tasks/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { TaskCard } from "@/components/tasks/task-card";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks?limit=50")
      .then((r) => r.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>加载中...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">任务列表</h1>
      {tasks.length === 0 ? (
        <p className="text-muted-foreground">暂无任务</p>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 9: 创建创建任务页**

创建 `web/src/app/tasks/create/page.tsx`:

```tsx
import { TaskForm } from "@/components/tasks/task-form";

export default function CreateTaskPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">创建爬取任务</h1>
      <TaskForm />
    </div>
  );
}
```

- [ ] **Step 10: 创建任务详情页**

创建 `web/src/app/tasks/[taskId]/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAgentEvents } from "@/hooks/use-agent-events";

const statusLabels: Record<string, string> = {
  pending: "等待中",
  running: "运行中",
  planning: "规划中",
  navigating: "导航中",
  extracting: "提取中",
  validating: "验证中",
  exporting: "导出中",
  completed: "已完成",
  failed: "失败",
  cancelled: "已取消",
};

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.taskId as string;
  const [task, setTask] = useState<any>(null);
  const { events, taskStatus } = useAgentEvents(taskId);

  useEffect(() => {
    fetch(`/api/tasks/${taskId}`)
      .then((r) => r.json())
      .then(setTask);
  }, [taskId]);

  if (!task) return <p>加载中...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">任务详情</h1>
        <Badge>{statusLabels[taskStatus] || taskStatus}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">任务描述</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{task.userInput}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Agent 执行过程</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.map((event, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="font-mono text-xs text-muted-foreground w-24 shrink-0">
                  {event.type}
                </span>
                <span>{event.title || event.description || JSON.stringify(event).slice(0, 100)}</span>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-muted-foreground">等待执行...</p>
            )}
          </div>
        </CardContent>
      </Card>

      {task.resultData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">结果数据</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm">
              {JSON.stringify(task.resultData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 11: 提交**

```bash
cd /Users/yuwang/code/ai
git add web/src/app/ web/src/components/ web/src/hooks/
git commit -m "feat: 添加前端页面（首页、任务管理、Agent 可视化）"
```

---

## Task 9: 前端页面 — Skill 市场 + 设置

**目标:** 实现 Skill 浏览和设置页面。

**Files:**
- Create: `web/src/components/skills/skill-card.tsx`
- Create: `web/src/app/skills/page.tsx`
- Create: `web/src/app/settings/page.tsx`

- [ ] **Step 1: 创建 Skill 卡片组件**

创建 `web/src/components/skills/skill-card.tsx`:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SkillCardProps {
  skill: {
    name: string;
    displayName: string;
    description: string;
    version: string;
    type: string;
  };
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{skill.displayName}</CardTitle>
          <Badge variant={skill.type === "native" ? "default" : "secondary"}>
            {skill.type === "native" ? "内置" : "OpenClaw"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">{skill.description}</p>
        <p className="text-xs text-muted-foreground">v{skill.version}</p>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: 创建 Skill 市场页**

创建 `web/src/app/skills/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { SkillCard } from "@/components/skills/skill-card";

export default function SkillsPage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then((data) => {
        setSkills(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>加载中...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Skill 市场</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <SkillCard key={skill.name} skill={skill} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 创建设置页**

创建 `web/src/app/settings/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">设置</h1>

      <Card>
        <CardHeader>
          <CardTitle>LLM 配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Provider</Label>
            <Input
              value={settings.llm_provider || ""}
              onChange={(e) =>
                setSettings((s) => ({ ...s, llm_provider: e.target.value }))
              }
              placeholder="google"
            />
          </div>
          <div>
            <Label>Model</Label>
            <Input
              value={settings.llm_model || ""}
              onChange={(e) =>
                setSettings((s) => ({ ...s, llm_model: e.target.value }))
              }
              placeholder="gemini-2.5-flash"
            />
          </div>
          <div>
            <Label>API Key</Label>
            <Input
              type="password"
              value={settings.llm_api_key || ""}
              onChange={(e) =>
                setSettings((s) => ({ ...s, llm_api_key: e.target.value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "保存中..." : "保存设置"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: 提交**

```bash
cd /Users/yuwang/code/ai
git add web/src/components/skills/ web/src/app/skills/ web/src/app/settings/
git commit -m "feat: 添加 Skill 市场和设置页面"
```

---

## Task 10: RPA 录制系统

**目标:** 实现操作录制 → LLM 优化 → RPA 工作流固化。

**Files:**
- Create: `web/src/lib/rpa/recorder.ts`
- Create: `web/src/lib/rpa/optimizer.ts`
- Create: `web/src/lib/rpa/executor.ts`
- Create: `web/src/app/api/rpa/record/route.ts`
- Create: `web/src/app/api/rpa/stop/route.ts`
- Create: `web/src/app/api/rpa/workflows/route.ts`
- Create: `web/src/app/api/rpa/workflows/[id]/execute/route.ts`
- Test: `web/tests/rpa/optimizer.test.ts`

- [ ] **Step 1: 写 RPA 优化器测试**

创建 `web/tests/rpa/optimizer.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";

vi.mock("@mariozechner/pi-ai", () => ({
  getModel: vi.fn(),
  complete: vi.fn().mockResolvedValue({
    content: JSON.stringify([
      { action: "navigate", target: "https://example.com", description: "Open page" },
      { action: "click", target: "@e5", description: "Click search button" },
    ]),
  }),
}));

describe("RPA Optimizer", () => {
  it("should export optimizeToRPA function", async () => {
    const mod = await import("@/lib/rpa/optimizer");
    expect(typeof mod.optimizeToRPA).toBe("function");
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd /Users/yuwang/code/ai/web
pnpm test -- --run tests/rpa/
```

Expected: FAIL

- [ ] **Step 3: 实现 RPA 录制器**

创建 `web/src/lib/rpa/recorder.ts`:

```typescript
import { chromium, type Browser, type Page } from "playwright";

export interface RecordedAction {
  type: "navigate" | "click" | "fill" | "scroll" | "wait";
  selector?: string;
  ref?: string;
  value?: string;
  url?: string;
  timestamp: number;
}

export class ActionRecorder {
  private actions: RecordedAction[] = [];
  private browser: Browser | null = null;
  private page: Page | null = null;

  async start(url: string): Promise<void> {
    this.browser = await chromium.launch({ headless: false });
    this.page = await this.browser.newPage();

    await this.page.addInitScript(() => {
      (window as any).__recordedActions = [];

      function generateSelector(el: HTMLElement): string {
        if (el.id) return `#${el.id}`;
        const classes = Array.from(el.classList).slice(0, 2).join(".");
        return `${el.tagName.toLowerCase()}${classes ? "." + classes : ""}`;
      }

      document.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        (window as any).__recordedActions.push({
          type: "click",
          selector: generateSelector(target),
          timestamp: Date.now(),
        });
      });

      document.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        (window as any).__recordedActions.push({
          type: "fill",
          selector: generateSelector(target),
          value: target.value,
          timestamp: Date.now(),
        });
      });
    });

    await this.page.goto(url);
    this.actions = [{ type: "navigate", url, timestamp: Date.now() }];
  }

  async getActions(): Promise<RecordedAction[]> {
    if (!this.page) return this.actions;
    const pageActions = await this.page.evaluate(
      () => (window as any).__recordedActions || []
    );
    return [...this.actions, ...pageActions];
  }

  async stop(): Promise<RecordedAction[]> {
    const actions = await this.getActions();
    await this.browser?.close();
    this.browser = null;
    this.page = null;
    return actions;
  }
}
```

- [ ] **Step 4: 实现 RPA 优化器**

创建 `web/src/lib/rpa/optimizer.ts`:

```typescript
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
      },
    ],
    tools: [],
  });

  const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
  return JSON.parse(content);
}
```

- [ ] **Step 5: 实现 RPA 执行器**

创建 `web/src/lib/rpa/executor.ts`:

```typescript
import { mcpClient } from "@/lib/browser/mcp-client";
import type { RPAStep } from "./optimizer";

export async function executeRPA(steps: RPAStep[]): Promise<void> {
  for (const step of steps) {
    switch (step.action) {
      case "navigate":
        await mcpClient.callTool("browser_navigate", { url: step.target });
        break;
      case "click":
        await mcpClient.callTool("browser_click", { uid: step.target });
        break;
      case "fill":
        await mcpClient.callTool("browser_fill", {
          uid: step.target,
          value: step.value || "",
        });
        break;
      case "scroll":
        await mcpClient.callTool("browser_scroll", { direction: step.target });
        break;
      case "wait":
        await new Promise((r) => setTimeout(r, Number(step.target) || 1000));
        break;
    }
  }
}
```

- [ ] **Step 6: 实现 RPA API 路由**

创建 `web/src/app/api/rpa/record/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { ActionRecorder } from "@/lib/rpa/recorder";

let recorder: ActionRecorder | null = null;

export async function POST(req: Request) {
  const { url } = await req.json();
  recorder = new ActionRecorder();
  await recorder.start(url);
  return NextResponse.json({ status: "recording" });
}
```

创建 `web/src/app/api/rpa/stop/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { optimizeToRPA } from "@/lib/rpa/optimizer";

// recorder 实例通过 record route 共享
export async function POST(req: Request) {
  const { actions, goal } = await req.json();
  const steps = await optimizeToRPA(actions, goal);
  return NextResponse.json({ steps });
}
```

创建 `web/src/app/api/rpa/workflows/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rpaWorkflows } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const workflows = await db.select().from(rpaWorkflows).orderBy(desc(rpaWorkflows.createdAt));
  return NextResponse.json(workflows);
}
```

创建 `web/src/app/api/rpa/workflows/[id]/execute/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rpaWorkflows, executionHistory } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { executeRPA } from "@/lib/rpa/executor";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [workflow] = await db
    .select()
    .from(rpaWorkflows)
    .where(eq(rpaWorkflows.id, id));

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const start = Date.now();
  try {
    await executeRPA(workflow.steps as any);
    await db.insert(executionHistory).values({
      workflowId: id,
      status: "success",
      duration: Date.now() - start,
    });
    return NextResponse.json({ status: "success" });
  } catch (err: any) {
    await db.insert(executionHistory).values({
      workflowId: id,
      status: "failed",
      duration: Date.now() - start,
      result: { error: err.message },
    });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

- [ ] **Step 7: 运行测试确认通过**

```bash
cd /Users/yuwang/code/ai/web
pnpm test -- --run tests/rpa/
```

Expected: 全部 PASS

- [ ] **Step 8: 提交**

```bash
cd /Users/yuwang/code/ai
git add web/src/lib/rpa/ web/src/app/api/rpa/ web/tests/rpa/
git commit -m "feat: 添加 RPA 录制系统（录制 → 优化 → 执行）"
```

---

## Task 11: 国际化 (i18n)

**目标:** 使用 next-intl 实现中英文双语支持。

**Files:**
- Create: `web/src/i18n/request.ts`
- Create: `web/src/i18n/routing.ts`
- Create: `web/messages/zh.json`
- Create: `web/messages/en.json`
- Modify: `web/src/app/layout.tsx`
- Modify: `web/next.config.ts`

- [ ] **Step 1: 安装 next-intl**

```bash
cd /Users/yuwang/code/ai/web
pnpm add next-intl
```

- [ ] **Step 2: 创建 i18n 路由配置**

创建 `web/src/i18n/routing.ts`:

```typescript
import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["zh", "en"],
  defaultLocale: "zh",
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
```

- [ ] **Step 3: 创建 i18n request 配置**

创建 `web/src/i18n/request.ts`:

```typescript
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 4: 创建中文翻译文件**

创建 `web/messages/zh.json`:

```json
{
  "common": {
    "appName": "AI Scraper Agent",
    "loading": "加载中...",
    "save": "保存",
    "cancel": "取消",
    "delete": "删除",
    "create": "创建",
    "edit": "编辑",
    "search": "搜索",
    "back": "返回"
  },
  "nav": {
    "home": "首页",
    "tasks": "任务",
    "createTask": "创建任务",
    "skills": "Skills",
    "settings": "设置"
  },
  "home": {
    "title": "AI Scraper Agent",
    "subtitle": "用自然语言描述你想抓取的数据，AI 自动完成爬取",
    "startButton": "开始爬取",
    "feature1Title": "自然语言驱动",
    "feature1Desc": "无需编写代码或选择器，用自然语言描述需求即可",
    "feature2Title": "多角色 AI 协作",
    "feature2Desc": "规划、导航、提取、验证，智能分工协作",
    "feature3Title": "可扩展 Skill 系统",
    "feature3Desc": "支持 OpenClaw 技能，一键安装扩展爬虫能力"
  },
  "tasks": {
    "title": "任务列表",
    "empty": "暂无任务",
    "create": "创建爬取任务",
    "inputLabel": "描述你想抓取的数据",
    "inputPlaceholder": "例如：抓取 Hacker News 前10条标题",
    "outputFormat": "输出格式",
    "startButton": "开始爬取",
    "creating": "创建中...",
    "detail": "任务详情",
    "description": "任务描述",
    "agentProcess": "Agent 执行过程",
    "resultData": "结果数据",
    "waiting": "等待执行..."
  },
  "status": {
    "pending": "等待中",
    "running": "运行中",
    "planning": "规划中",
    "navigating": "导航中",
    "extracting": "提取中",
    "validating": "验证中",
    "exporting": "导出中",
    "completed": "已完成",
    "failed": "失败",
    "cancelled": "已取消"
  },
  "skills": {
    "title": "Skill 市场",
    "builtin": "内置",
    "openclaw": "OpenClaw"
  },
  "settings": {
    "title": "设置",
    "llmConfig": "LLM 配置",
    "provider": "Provider",
    "model": "Model",
    "apiKey": "API Key",
    "saving": "保存中..."
  }
}
```

- [ ] **Step 5: 创建英文翻译文件**

创建 `web/messages/en.json`:

```json
{
  "common": {
    "appName": "AI Scraper Agent",
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "create": "Create",
    "edit": "Edit",
    "search": "Search",
    "back": "Back"
  },
  "nav": {
    "home": "Home",
    "tasks": "Tasks",
    "createTask": "Create Task",
    "skills": "Skills",
    "settings": "Settings"
  },
  "home": {
    "title": "AI Scraper Agent",
    "subtitle": "Describe the data you want to scrape in natural language, AI handles the rest",
    "startButton": "Start Scraping",
    "feature1Title": "Natural Language Driven",
    "feature1Desc": "No code or selectors needed, just describe what you want",
    "feature2Title": "Multi-Agent Collaboration",
    "feature2Desc": "Planning, navigation, extraction, validation — intelligent teamwork",
    "feature3Title": "Extensible Skill System",
    "feature3Desc": "Supports OpenClaw skills, one-click install to extend capabilities"
  },
  "tasks": {
    "title": "Tasks",
    "empty": "No tasks yet",
    "create": "Create Scraping Task",
    "inputLabel": "Describe the data you want to scrape",
    "inputPlaceholder": "e.g. Scrape top 10 titles from Hacker News",
    "outputFormat": "Output Format",
    "startButton": "Start Scraping",
    "creating": "Creating...",
    "detail": "Task Details",
    "description": "Task Description",
    "agentProcess": "Agent Execution Process",
    "resultData": "Result Data",
    "waiting": "Waiting to execute..."
  },
  "status": {
    "pending": "Pending",
    "running": "Running",
    "planning": "Planning",
    "navigating": "Navigating",
    "extracting": "Extracting",
    "validating": "Validating",
    "exporting": "Exporting",
    "completed": "Completed",
    "failed": "Failed",
    "cancelled": "Cancelled"
  },
  "skills": {
    "title": "Skill Marketplace",
    "builtin": "Built-in",
    "openclaw": "OpenClaw"
  },
  "settings": {
    "title": "Settings",
    "llmConfig": "LLM Configuration",
    "provider": "Provider",
    "model": "Model",
    "apiKey": "API Key",
    "saving": "Saving..."
  }
}
```

- [ ] **Step 6: 更新 next.config.ts 加入 i18n 插件**

修改 `web/next.config.ts`:

```typescript
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig = {};

export default withNextIntl(nextConfig);
```

- [ ] **Step 7: 提交**

```bash
cd /Users/yuwang/code/ai
git add web/src/i18n/ web/messages/ web/next.config.ts
git commit -m "feat: 添加国际化支持（中英文）"
```

---

## Task 12: Docker 部署配置

**目标:** 配置 Docker Compose 生产部署。

**Files:**
- Create: `web/Dockerfile`
- Create: `web/docker-compose.yml`
- Create: `web/.dockerignore`

- [ ] **Step 1: 创建 Dockerfile**

创建 `web/Dockerfile`:

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

- [ ] **Step 2: 创建 docker-compose.yml**

创建 `web/docker-compose.yml`:

```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/ai_scraper
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - LLM_PROVIDER=${LLM_PROVIDER:-google}
      - LLM_MODEL=${LLM_MODEL:-gemini-2.5-flash}
      - LLM_API_KEY=${LLM_API_KEY}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  worker:
    build: .
    command: node dist/worker.js
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/ai_scraper
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - LLM_PROVIDER=${LLM_PROVIDER:-google}
      - LLM_MODEL=${LLM_MODEL:-gemini-2.5-flash}
      - LLM_API_KEY=${LLM_API_KEY}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=ai_scraper
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

- [ ] **Step 3: 创建 .dockerignore**

创建 `web/.dockerignore`:

```
node_modules
.next
.git
.env
.env.local
```

- [ ] **Step 4: 提交**

```bash
cd /Users/yuwang/code/ai
git add web/Dockerfile web/docker-compose.yml web/.dockerignore
git commit -m "feat: 添加 Docker 部署配置"
```

---

## Task 13: 全量测试 + 最终验证

**目标:** 运行所有测试，确保项目可构建。

**Files:**
- Modify: `web/package.json` (如果需要)

- [ ] **Step 1: 运行全部单元测试**

```bash
cd /Users/yuwang/code/ai/web
pnpm test
```

Expected: 全部 PASS

- [ ] **Step 2: 运行 TypeScript 类型检查**

```bash
cd /Users/yuwang/code/ai/web
pnpm exec tsc --noEmit
```

Expected: 无错误

- [ ] **Step 3: 运行构建**

```bash
cd /Users/yuwang/code/ai/web
pnpm build
```

Expected: 构建成功

- [ ] **Step 4: 运行 ESLint**

```bash
cd /Users/yuwang/code/ai/web
pnpm lint
```

Expected: 无错误

- [ ] **Step 5: 提交**

```bash
cd /Users/yuwang/code/ai
git add web/
git commit -m "chore: 全量测试通过，项目可构建"
```
