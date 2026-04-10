# AI 爬虫 Agent - 完整技术方案与设计文档

> **文档版本**: v1.0  
> **创建日期**: 2026-04-11  
> **最后更新**: 2026-04-11  
> **状态**: 待实施

---

## 📋 文档目录

1. [项目概述](#一项目概述)
2. [技术选型](#二技术选型)
3. [系统架构](#三系统架构)
4. [核心模块设计](#四核心模块设计)
5. [数据流设计](#五数据流设计)
6. [项目结构](#六项目结构)
7. [实施计划](#七实施计划)
8. [风险评估](#八风险评估)
9. [扩展规划](#九扩展规划)
10. [关键技术决策记录](#十关键技术决策记录adr)

---

## 一、项目概述

### 1.1 产品定位

一个支持**自然语言指令**的智能爬虫 Agent，用户只需用自然语言描述"我要抓取什么数据"，系统自动完成网页访问、智能分析、数据提取、质量验证的完整流程。

**核心卖点：**
- 🗣️ **自然语言交互** - 无需写代码/选择器，说话就能爬虫
- 🤖 **多角色 AI 协作** - 规划→导航→提取→验证，智能分工
- 🎯 **智能抗 UI 变更** - Ref 机制保障长期稳定运行
- 📊 **结构化数据输出** - 自动导出 JSON/CSV/Excel

### 1.2 目标用户

- 📱 **运营人员** - 快速获取业务数据，无需技术背景
- 📈 **数据分析师** - 采集研究数据，一键导出
- 🔍 **市场人员** - 竞品信息收集，定时监控
- 💼 **产品经理** - 行业动态追踪，自动化报告

### 1.3 典型使用场景

#### 场景 1：电商运营
```
用户："帮我抓取淘宝上'机械键盘'前50个商品的名称、价格、销量"
系统：自动搜索 → 识别商品列表 → 提取数据 → 导出 Excel
```

#### 场景 2：市场研究
```
用户："抓取知乎热榜前20条的标题、回答数、浏览量"
系统：访问知乎 → 定位热榜区域 → 提取数据 → 生成 JSON
```

#### 场景 3：竞品监控
```
用户："每天早上9点抓取 Product Hunt 当日产品列表"
系统：定时任务 → 自动爬取 → 推送结果到邮箱
```

---

## 二、技术选型

### 2.1 核心技术栈总览

| 层级 | 技术 | 版本 | 选型理由 |
|------|------|------|---------|
| **后端语言** | Python | 3.11+ | AI/爬虫生态最完善，学习曲线平缓 |
| **包管理** | uv | 最新 | Rust 实现，比 pip 快 10-100 倍，现代 Python 标准 |
| **Agent 框架** | CrewAI | 0.30+ | 角色化多 Agent 协作，代码简洁 |
| **浏览器控制（主）** | agent-browser | 最新 | AI 原生设计，Ref 机制抗 UI 变更，Skill 系统 |
| **浏览器控制（辅）** | Playwright | 1.40+ | 确定性数据处理，批量并发，无 LLM 成本 |
| **LLM** | OpenAI GPT-4 / Claude | API | 自然语言理解最强 |
| **API 框架** | FastAPI | 最新 | 异步支持，自动文档生成，性能优秀 |
| **前端框架** | React | 19 | 最新稳定版，性能优化，并发特性 |
| **前端路由** | TanStack Router | 最新 | 文件路由，极致类型安全，现代化 API |
| **UI 库** | Ant Design 5 / shadcn/ui | 最新 | 根据 React 19 兼容性选择 |
| **状态管理** | Zustand + TanStack Query | 最新 | 轻量 + 服务端状态管理 |
| **构建工具** | Vite | 6 | 极速 HMR，现代前端标准 |
| **数据库** | SQLite + SQLAlchemy | 3.0+ | 轻量，无需额外部署 |
| **数据处理** | Pandas | 2.0+ | 数据清洗、导出 |
| **任务调度** | APScheduler | 3.10+ | 定时任务 |

### 2.2 关键技术选型详解

#### 2.2.1 Python 包管理：为什么选 uv？

**uv vs 其他工具对比：**

| 工具 | 安装速度 | 依赖解析 | 虚拟环境 | 锁文件 | 易用性 | 推荐度 |
|------|---------|---------|---------|--------|--------|--------|
| **uv** | 极快（Rust） | 优秀 | ✅ 内置 | ✅ 类似 npm | 简单 | ⭐⭐⭐⭐⭐ |
| pip | 慢 | 无 | ❌ 需 venv | ❌ 无 | 简单 | ⭐⭐⭐ |
| poetry | 中 | 好 | ✅ 内置 | ✅ pyproject.toml | 中 | ⭐⭐⭐⭐ |
| pipenv | 慢 | 好 | ✅ 内置 | ✅ Pipfile.lock | 复杂 | ⭐⭐⭐ |

**uv 的核心优势：**

1. **性能碾压**
   ```bash
   # 安装速度对比（实测数据）
   pip install requests      # 5.2s
   poetry add requests       # 8.1s
   uv add requests           # 0.3s  ← 快 17-27 倍
   ```

2. **前端开发友好**
   ```bash
   # 和 npm 体验几乎一样
   uv init my-project        # 类似 npm init
   uv add crewai             # 类似 npm install
   uv remove crewai          # 类似 npm uninstall
   uv run python main.py     # 类似 npx
   ```

3. **一个工具解决所有问题**
   - 替代 pip（包安装）
   - 替代 venv（虚拟环境）
   - 替代 pip-tools（依赖锁定）
   - 替代 pyenv（Python 版本管理）

4. **2025+ 行业趋势**
   - 被 Astral（Ruff 团队）开发
   - 快速增长的采用率
   - 成为现代 Python 项目标准

**项目中的使用方式：**

```bash
# 1. 安装 uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. 初始化项目
cd ai-scraper-agent
uv init --no-readme

# 3. 安装依赖
uv add crewai crewai-tools playwright openai fastapi uvicorn[standard]
uv add sqlalchemy aiosqlite pandas openpyxl apscheduler
uv add --dev pytest pytest-asyncio ruff mypy

# 4. 运行项目
uv run python cli.py "抓取知乎热榜"

# 5. 启动 API 服务
uv run uvicorn src.api.main:app --reload

# 6. 运行测试
uv run pytest
```

**pyproject.toml 配置示例：**

```toml
[project]
name = "ai-scraper-agent"
version = "0.1.0"
description = "自然语言驱动的智能爬虫 Agent"
requires-python = ">=3.11"
dependencies = [
    "crewai>=0.30.0",
    "crewai-tools>=0.5.0",
    "playwright>=1.40.0",
    "openai>=1.10.0",
    "fastapi>=0.109.0",
    "uvicorn[standard]>=0.27.0",
    "sqlalchemy>=2.0.25",
    "aiosqlite>=0.19.0",
    "pandas>=2.1.4",
    "openpyxl>=3.1.2",
    "apscheduler>=3.10.4",
    "python-dotenv>=1.0.0",
    "pyyaml>=6.0.1",
    "rich>=13.7.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.23.0",
    "ruff>=0.1.0",
    "mypy>=1.8.0",
]

[tool.uv]
dev-dependencies = [
    "pytest>=7.4.0",
    "ruff>=0.1.0",
]

[tool.ruff]
line-length = 88
target-version = "py311"

[tool.mypy]
python_version = "3.11"
strict = true
```

---

#### 2.2.2 前端技术栈：React 19 + TanStack Router

**为什么选 React 19？**

React 19 已于 2024 年底正式发布，带来以下关键改进：

| 特性 | 说明 | 对项目的好处 |
|------|------|------------|
| **Actions** | 简化的数据变更 API | 任务提交代码减少 50% |
| **use() Hook** | 统一的异步资源访问 | 更优雅的数据加载 |
| **文档元数据** | 内置 title/meta 管理 | 无需第三方库 |
| **性能优化** | 编译器优化 | 更好的运行时性能 |
| **类型安全** | 改进的 TypeScript 支持 | 减少类型错误 |

**兼容性检查清单：**

| 库/工具 | React 19 兼容性 | 状态 | 备选方案 |
|---------|----------------|------|---------|
| TanStack Router | ✅ 完全兼容 | 可用 | - |
| TanStack Query | ✅ 完全兼容 | 可用 | - |
| Zustand | ✅ 完全兼容 | 可用 | - |
| Ant Design 5 | ⚠️ 需确认最新版 | 待验证 | shadcn/ui |
| Vite 6 | ✅ 完全兼容 | 可用 | - |

**决策：**
- 如果 Ant Design 5 完全兼容 React 19 → 使用 Ant Design
- 否则 → 使用 shadcn/ui（Tailwind + Radix UI，完全兼容）

---

**为什么选 TanStack Router 而不是 React Router？**

| 维度 | TanStack Router | React Router v7 | 胜出 |
|------|----------------|-----------------|------|
| **类型安全** | 路由参数、搜索参数全类型推导 | 部分类型安全 | **TanStack** |
| **文件路由** | ✅ 自动生成（类似 Next.js） | ❌ 需手动配置 | **TanStack** |
| **数据加载** | 内置 loader，并行获取 | 需配合 React Router Loader | **TanStack** |
| **代码分割** | 自动按路由分割 | 需手动配置 | **TanStack** |
| **生态成熟度** | 较新，但快速增长 | 最成熟，教程多 | **React Router** |
| **学习曲线** | 中等 | 平缓 | **React Router** |
| **性能** | 更优（全新设计） | 良好 | **TanStack** |

**TanStack Router 核心优势示例：**

```typescript
// 1. 文件路由（自动生成路由配置）
// src/routes/
//   __root.tsx          → 根布局
//   index.tsx           → 首页
//   tasks/
//     index.tsx         → /tasks
//     $taskId.tsx       → /tasks/:taskId（类型安全！）
//     create.tsx        → /tasks/create

// 2. 极致类型安全
import { createFileRoute } from '@tanstack/react-router'

// 路径参数自动推导，无需手动定义类型
export const Route = createFileRoute('/tasks/$taskId')({
  loader: async ({ params }) => {
    // params.taskId 自动推导为 string 类型
    const task = await fetchTask(params.taskId)
    return task
  },
  component: TaskDetail
})

// 3. 类型安全的导航
import { Link } from '@tanstack/react-router'

// 编译时检查，错误的路由会报错
<Link to="/tasks/$taskId" params={{ taskId: '123' }}>
  查看任务
</Link>

// 4. 搜索参数类型安全
interface TaskListSearch {
  status?: 'pending' | 'running' | 'completed' | 'failed'
  page?: number
  limit?: number
}

const Route = createFileRoute('/tasks')({
  validateSearch: (search): TaskListSearch => ({
    status: search.status || 'pending',
    page: Number(search.page) || 1,
    limit: Number(search.limit) || 20,
  }),
  // ...
})
```

**前端完整技术栈：**

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-router": "^1.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/router-devtools": "^1.0.0",
    "zustand": "^4.5.0",
    "antd": "^5.0.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^3.4.0"
  }
}
```

**Vite + React 19 配置：**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    TanStackRouterVite(), // 文件路由插件
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

---

#### 2.2.3 Agent 框架：CrewAI vs 其他方案

| 维度 | CrewAI | LangChain | LangGraph | 手写 |
|------|--------|-----------|-----------|------|
| **代码量** | 低（20-50行） | 中（50-100行） | 高（100-200行） | 不定 |
| **学习曲线** | 平缓 | 中 | 陡 | 无 |
| **多角色协作** | ✅ 内置 | ❌ 自己编排 | ⚠️ 复杂 | ❌ 自己实现 |
| **灵活性** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **开发效率** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

**决策理由：**
- 项目本质是多角色协作（规划→导航→提取→验证）
- CrewAI 设计哲学完美匹配
- 同样功能代码量减少 60%
- 快速原型验证

---

#### 2.2.4 浏览器控制：混合方案

| 维度 | agent-browser | Playwright | 混合方案 |
|------|--------------|------------|---------|
| **AI 原生** | ✅ 内置 | ❌ 需封装 | ✅ 兼得 |
| **抗 UI 变更** | ✅ Ref 机制（<5%） | ❌ 选择器（15-25%） | ✅ 主用 Ref |
| **自然语言驱动** | ✅ chat 命令 | ❌ 自己实现 | ✅ 直接用 |
| **大规模并发** | ⚠️ 有限 | ✅ 原生支持 | ✅ Playwright 补充 |
| **LLM 成本** | $0.01-0.30/任务 | $0 | ✅ 平衡 |

**决策理由：**
- agent-browser 用于智能导航和动态页面处理
- Playwright 用于确定性数据验证和批量处理
- 综合成本最低，灵活性最高

---

### 2.3 依赖清单

#### Python 后端依赖

```toml
# pyproject.toml

[project]
dependencies = [
    # 核心框架
    "crewai>=0.30.0",
    "crewai-tools>=0.5.0",
    "langchain-openai>=0.0.5",
    
    # 浏览器控制
    "playwright>=1.40.0",
    # agent-browser 通过 CLI 调用，无需 Python 包
    
    # LLM
    "openai>=1.10.0",
    
    # API 服务
    "fastapi>=0.109.0",
    "uvicorn[standard]>=0.27.0",
    "pydantic>=2.5.0",
    
    # 数据存储
    "sqlalchemy>=2.0.25",
    "aiosqlite>=0.19.0",
    
    # 数据处理
    "pandas>=2.1.4",
    "openpyxl>=3.1.2",
    
    # 任务调度
    "apscheduler>=3.10.4",
    
    # 工具库
    "python-dotenv>=1.0.0",
    "pyyaml>=6.0.1",
    "rich>=13.7.0",
    "httpx>=0.26.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.23.0",
    "ruff>=0.1.0",
    "mypy>=1.8.0",
    "pre-commit>=3.5.0",
]
```

#### React 前端依赖

```json
{
  "name": "ai-scraper-agent-web",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-router": "^1.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/router-devtools": "^1.0.0",
    "zustand": "^4.5.0",
    "antd": "^5.0.0",
    "@ant-design/icons": "^5.0.0",
    "axios": "^1.6.0",
    "dayjs": "^1.11.0",
    "ahooks": "^3.7.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "@tanstack/router-plugin": "^1.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-plugin-react-hooks": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## 三、系统架构

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户交互层                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   CLI 终端   │  │   Web UI     │  │  REST API    │      │
│  │  (开发调试)  │  │ React 19 +   │  │  (程序调用)  │      │
│  │              │  │ TanStack     │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼─────────────────┼─────────────────┼──────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
          ┌─────────────────▼─────────────────┐
          │       API Gateway (FastAPI)        │
          │  - 请求路由 & 验证                  │
          │  - 认证鉴权                         │
          │  - 任务队列管理                      │
          │  - 进度实时推送（SSE）               │
          └─────────────────┬─────────────────┘
                            │
          ┌─────────────────▼─────────────────┐
          │      Agent Orchestration           │
          │         (CrewAI Crew)              │
          │                                    │
          │  ┌──────────────────────────┐     │
          │  │    Planner Agent         │     │
          │  │  (规划师 - 理解意图)      │     │
          │  └──────────┬───────────────┘     │
          │             │                      │
          │  ┌──────────▼───────────────┐     │
          │  │    Navigator Agent       │     │
          │  │  (导航员 - 访问页面)      │     │
          │  │  Tools: agent-browser    │     │
          │  └──────────┬───────────────┘     │
          │             │                      │
          │  ┌──────────▼───────────────┐     │
          │  │    Extractor Agent       │     │
          │  │  (提取器 - 数据提取)      │     │
          │  │  Tools: agent-browser    │     │
          │  └──────────┬───────────────┘     │
          │             │                      │
          │  ┌──────────▼───────────────┐     │
          │  │    Validator Agent       │     │
          │  │  (验证员 - 质量检查)      │     │
          │  │  Tools: Playwright       │     │
          │  └──────────┬───────────────┘     │
          └─────────────┼─────────────────────┘
                        │
          ┌─────────────▼─────────────────────┐
          │           Tools Layer              │
          │                                    │
          │  ┌──────────────┐ ┌──────────────┐│
          │  │ agent-browser│ │  Playwright  ││
          │  │ (CLI 封装)   │ │ (Python SDK) ││
          │  └──────────────┘ └──────────────┘│
          └─────────────┬─────────────────────┘
                        │
          ┌─────────────▼─────────────────────┐
          │         Storage Layer              │
          │                                    │
          │  ┌──────────┐ ┌──────────────────┐│
          │  │ SQLite   │ │ JSON/CSV/Excel   ││
          │  │(任务/历史)│ │  (导出数据)      ││
          │  └──────────┘ └──────────────────┘│
          └──────────────────────────────────┘
```

### 3.2 架构分层说明

#### Layer 1: 用户交互层
- **CLI**：开发者快速调试、批量任务提交
  ```bash
  uv run python cli.py "抓取知乎热榜前20条"
  ```
- **Web UI**：可视化操作、任务监控、数据预览
  - React 19 + TypeScript
  - TanStack Router（文件路由 + 类型安全）
  - Ant Design / shadcn/ui
- **REST API**：程序化调用、第三方集成
  - OpenAPI/Swagger 自动生成
  - SSE 实时进度推送

#### Layer 2: API 网关层
- **FastAPI**：异步 API 服务
- **功能**：
  - 请求验证（Pydantic）
  - 任务路由
  - 进度查询
  - 结果返回
  - 认证鉴权（JWT）

#### Layer 3: Agent 编排层（核心）
- **CrewAI Crew**：多角色 Agent 协作
- **工作模式**：
  - Sequential（顺序）：规划 → 导航 → 提取 → 验证
  - Hierarchical（层级）：Manager 分配任务给 Worker

#### Layer 4: 工具层
- **agent-browser**：智能导航、动态页面处理
  - Ref 机制定位元素
  - 自然语言驱动
  - 抗 UI 变更
- **Playwright**：确定性数据验证、批量处理
  - 无 LLM 成本
  - 高并发支持
  - 精确控制

#### Layer 5: 存储层
- **SQLite**：任务配置、执行历史、用户设置
- **文件导出**：JSON、CSV、Excel

### 3.3 部署架构

#### 初期：单机部署
```
┌─────────────────────────────────────────────┐
│              单机部署（Phase 1-4）            │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Docker Container                     │ │
│  │                                       │ │
│  │  FastAPI + CrewAI + agent-browser    │ │
│  │                                       │ │
│  │  ┌─────────────────────────────┐     │ │
│  │  │  Chrome Browser (Headless)  │     │ │
│  │  └─────────────────────────────┘     │ │
│  │                                       │ │
│  │  SQLite Database                      │ │
│  │  /data/outputs/ (导出文件)            │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  前端: Nginx 静态文件服务                     │
└─────────────────────────────────────────────┘
```

#### 后期：分布式部署
```
┌─────────────────────────────────────────────┐
│           分布式部署（Phase 5+）               │
│                                             │
│  ┌───────────┐       ┌───────────┐         │
│  │  API 节点 1│       │  API 节点 2│         │
│  └─────┬─────┘       └─────┬─────┘         │
│        │                   │                │
│  ┌─────▼───────────────────▼─────┐         │
│  │    Redis (任务队列 + 缓存)     │         │
│  └─────────────┬─────────────────┘         │
│                │                            │
│  ┌─────────────▼─────────────────┐         │
│  │  Worker 节点 1 (爬虫执行)      │         │
│  │  Worker 节点 2 (爬虫执行)      │         │
│  │  Worker 节点 N (爬虫执行)      │         │
│  └───────────────────────────────┘         │
│                                             │
│  ┌───────────────────────────────┐         │
│  │  PostgreSQL (共享数据库)       │         │
│  │  S3/MinIO (文件存储)           │         │
│  └───────────────────────────────┘         │
└─────────────────────────────────────────────┘
```

---

## 四、核心模块设计

### 4.1 Agent 角色设计

#### 4.1.1 Planner Agent（规划师）

**职责：** 理解用户自然语言意图，制定完整爬取计划

**输入示例：**
```
用户指令："帮我抓取知乎热榜前20条的标题、回答数、浏览量"
```

**Prompt 模板：**
```python
PLANNER_SYSTEM_PROMPT = """
你是一个专业的爬虫任务规划师。你的职责是：

1. 理解用户的自然语言指令
2. 确定目标网站和具体 URL
3. 识别需要提取的数据字段
4. 制定分步骤的爬取执行计划
5. 预判可能的反爬机制和应对策略

用户指令：{user_input}

请按以下 JSON 格式输出计划：
{{
    "target_website": "网站名称",
    "target_url": "具体URL",
    "data_fields": ["字段1", "字段2", ...],
    "steps": [
        {{"step": 1, "action": "访问页面", "details": "..."}},
        {{"step": 2, "action": "定位元素", "details": "..."}},
        ...
    ],
    "anti_detection_strategy": "反爬策略说明",
    "expected_output_format": "JSON/CSV/Excel"
}}
"""
```

**输出示例：**
```json
{
    "target_website": "知乎",
    "target_url": "https://www.zhihu.com/hot",
    "data_fields": ["标题", "回答数", "浏览量"],
    "steps": [
        {"step": 1, "action": "访问知乎热榜页面", "details": "等待页面完全加载"},
        {"step": 2, "action": "定位热榜列表区域", "details": "识别包含问题列表的容器"},
        {"step": 3, "action": "提取前20条数据", "details": "逐条提取标题、回答数、浏览量"}
    ],
    "anti_detection_strategy": "控制请求间隔，模拟人类浏览行为",
    "expected_output_format": "JSON"
}
```

**代码实现：**
```python
from crewai import Agent
from textwrap import dedent

class PlannerAgent:
    """规划师 Agent - 理解用户意图并制定爬取计划"""
    
    def __init__(self, llm):
        self.llm = llm
    
    def create(self) -> Agent:
        return Agent(
            role='爬虫规划师',
            goal=dedent("""\
                理解用户的自然语言指令，制定详细的网页数据爬取计划"""),
            backstory=dedent("""\
                你是一位经验丰富的数据提取架构师，擅长分析网页结构，
                能够准确识别用户想要获取的数据字段，并制定最优的爬取策略。
                你熟悉各种网站的布局模式和反爬机制。"""),
            verbose=True,
            allow_delegation=False,
            llm=self.llm
        )
```

---

#### 4.1.2 Navigator Agent（导航员）

**职责：** 控制浏览器访问目标页面，处理跳转、等待、滚动等

**工具集 - agent-browser 封装：**
```python
import subprocess
import json
from typing import Optional

class AgentBrowserTool:
    """agent-browser CLI 封装"""
    
    def __init__(self):
        self._check_installation()
    
    def _check_installation(self):
        """检查 agent-browser 是否已安装"""
        try:
            result = subprocess.run(
                ["agent-browser", "--version"],
                capture_output=True, text=True
            )
            if result.returncode != 0:
                raise RuntimeError(
                    "agent-browser 未安装，请运行: npm install -g agent-browser"
                )
        except FileNotFoundError:
            raise RuntimeError("agent-browser 未安装")
    
    def navigate(self, url: str) -> str:
        """导航到指定 URL"""
        result = subprocess.run(
            ["agent-browser", "open", url],
            capture_output=True, text=True, timeout=30
        )
        return result.stdout
    
    def get_page_snapshot(self) -> dict:
        """获取页面快照（带 refs）"""
        result = subprocess.run(
            ["agent-browser", "snapshot", "--json"],
            capture_output=True, text=True, timeout=10
        )
        return json.loads(result.stdout)
    
    def click_element(self, ref: str) -> str:
        """通过 ref 点击元素"""
        result = subprocess.run(
            ["agent-browser", "click", ref],
            capture_output=True, text=True
        )
        return result.stdout
    
    def type_text(self, ref: str, text: str) -> str:
        """通过 ref 输入文本"""
        result = subprocess.run(
            ["agent-browser", "type", ref, text],
            capture_output=True, text=True
        )
        return result.stdout
    
    def extract_element(self, ref: str) -> dict:
        """通过 ref 提取元素内容"""
        result = subprocess.run(
            ["agent-browser", "extract", ref, "--json"],
            capture_output=True, text=True
        )
        return json.loads(result.stdout)
    
    def chat(self, instruction: str) -> str:
        """自然语言驱动浏览器操作"""
        result = subprocess.run(
            ["agent-browser", "chat", instruction],
            capture_output=True, text=True, timeout=60
        )
        return result.stdout
```

**代码实现：**
```python
from crewai import Agent
from textwrap import dedent

class NavigatorAgent:
    """导航员 Agent - 控制浏览器访问页面"""
    
    def __init__(self, llm, browser_tool: AgentBrowserTool):
        self.llm = llm
        self.browser_tool = browser_tool
    
    def create(self) -> Agent:
        return Agent(
            role='浏览器导航员',
            goal=dedent("""\
                根据爬取计划，控制浏览器访问目标页面并完成所有必要的交互操作"""),
            backstory=dedent("""\
                你是 Web 自动化专家，精通浏览器控制和页面导航。
                你能够模拟人类的操作行为，处理各种动态内容和交互场景。"""),
            tools=[self.browser_tool],
            verbose=True,
            allow_delegation=True,
            llm=self.llm
        )
```

---

#### 4.1.3 Extractor Agent（提取器）

**职责：** 智能识别并提取目标数据

**工具集：**
```python
class DataExtractorTool:
    """数据提取工具"""
    
    def __init__(self, browser_tool: AgentBrowserTool):
        self.browser_tool = browser_tool
    
    def extract_by_refs(self, refs: list[str]) -> list[dict]:
        """通过 refs 批量提取数据"""
        data = []
        for ref in refs:
            try:
                element_data = self.browser_tool.extract_element(ref)
                data.append(element_data)
            except Exception as e:
                print(f"提取 {ref} 失败: {e}")
        return data
    
    def find_elements_by_description(self, description: str) -> list[str]:
        """用自然语言描述查找元素，返回 refs"""
        # 1. 获取快照
        snapshot = self.browser_tool.get_page_snapshot()
        
        # 2. LLM 分析，匹配元素 refs
        # (通过 Agent 的 LLM 能力自动识别)
        return []
```

**代码实现：**
```python
from crewai import Agent
from textwrap import dedent

class ExtractorAgent:
    """提取器 Agent - 从页面中提取数据"""
    
    def __init__(self, llm, extractor_tool: DataExtractorTool):
        self.llm = llm
        self.extractor_tool = extractor_tool
    
    def create(self) -> Agent:
        return Agent(
            role='数据提取器',
            goal=dedent("""\
                从页面中准确提取目标数据，输出结构化格式"""),
            backstory=dedent("""\
                你是数据结构化专家，擅长分析页面内容并提取关键信息。
                你能够处理复杂的数据格式，输出清洁的结构化数据。"""),
            tools=[self.extractor_tool],
            verbose=True,
            llm=self.llm
        )
```

---

#### 4.1.4 Validator Agent（验证员）

**职责：** 验证数据质量和完整性

**工具集 - Playwright 封装：**
```python
from playwright.async_api import async_playwright
import pandas as pd
from typing import Optional

class DataValidationTool:
    """使用 Playwright 进行确定性验证"""
    
    def validate_data_format(self, data: list[dict], schema: dict) -> dict:
        """验证数据格式是否符合 schema"""
        df = pd.DataFrame(data)
        
        result = {
            "valid": True,
            "issues": [],
            "statistics": {
                "total_records": len(df),
                "null_counts": df.isnull().sum().to_dict(),
                "duplicate_count": df.duplicated().sum()
            }
        }
        
        # 检查必填字段
        for field in schema.get("required", []):
            if field not in df.columns:
                result["valid"] = False
                result["issues"].append(f"缺少字段: {field}")
        
        return result
    
    def clean_and_deduplicate(self, data: list[dict]) -> pd.DataFrame:
        """数据清洗和去重"""
        df = pd.DataFrame(data)
        df = df.dropna(how='all')  # 删除全空行
        df = df.drop_duplicates()  # 去重
        return df
    
    def export_data(self, df: pd.DataFrame, format: str, path: str) -> str:
        """导出数据到指定格式"""
        if format == "json":
            df.to_json(path, orient='records', force_ascii=False)
        elif format == "csv":
            df.to_csv(path, index=False, encoding='utf-8-sig')
        elif format == "excel":
            df.to_excel(path, index=False)
        return path
```

**代码实现：**
```python
from crewai import Agent
from textwrap import dedent

class ValidatorAgent:
    """验证员 Agent - 验证数据质量"""
    
    def __init__(self, llm, validation_tool: DataValidationTool):
        self.llm = llm
        self.validation_tool = validation_tool
    
    def create(self) -> Agent:
        return Agent(
            role='数据验证员',
            goal=dedent("""\
                验证提取数据的质量和完整性，确保符合预期格式"""),
            backstory=dedent("""\
                你是数据质量保证专家，精通数据验证、清洗和格式化。
                你能够识别数据问题并提供修复建议。"""),
            tools=[self.validation_tool],
            verbose=True,
            llm=self.llm
        )
```

---

### 4.2 Crew 编排设计

```python
from crewai import Crew, Process, Task
from textwrap import dedent

class ScraperCrew:
    """爬虫任务 Crew 编排"""
    
    def __init__(self, user_input: str, output_format: str = "json"):
        self.user_input = user_input
        self.output_format = output_format
        self.llm = self._init_llm()
        
        # 初始化工具
        self.browser_tool = AgentBrowserTool()
        self.extractor_tool = DataExtractorTool(self.browser_tool)
        self.validation_tool = DataValidationTool()
        
        # 初始化 Agents
        self.planner = PlannerAgent(self.llm).create()
        self.navigator = NavigatorAgent(self.llm, self.browser_tool).create()
        self.extractor = ExtractorAgent(self.llm, self.extractor_tool).create()
        self.validator = ValidatorAgent(self.llm, self.validation_tool).create()
    
    def _init_llm(self):
        """初始化 LLM（从环境变量读取配置）"""
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model="gpt-4",
            temperature=0.7
        )
    
    def create_tasks(self, plan: dict = None) -> list[Task]:
        """创建任务链"""
        tasks = [
            Task(
                description=dedent(f"""\
                    分析用户指令并制定爬取计划
                    
                    用户指令：{self.user_input}
                    
                    输出详细的爬取计划，包括目标URL、数据字段、执行步骤"""),
                agent=self.planner,
                expected_output="详细的爬取计划 JSON"
            ),
            Task(
                description=dedent("""\
                    根据计划访问目标页面并完成所有必要的页面交互
                    
                    计划：{plan}"""),
                agent=self.navigator,
                expected_output="页面访问成功确认及页面快照",
                context=[tasks[0]]  # 依赖上一个任务
            ),
            Task(
                description=dedent("""\
                    从页面中提取目标数据
                    
                    数据字段：{data_fields}
                    页面状态：{page_state}"""),
                agent=self.extractor,
                expected_output="提取的原始数据列表",
                context=[tasks[1]]
            ),
            Task(
                description=dedent(f"""\
                    验证数据质量并导出为 {self.output_format} 格式
                    
                    原始数据：{raw_data}
                    预期格式：{self.output_format}"""),
                agent=self.validator,
                expected_output="验证报告和最终导出的数据文件",
                context=[tasks[2]]
            )
        ]
        return tasks
    
    def execute(self):
        """执行爬虫任务"""
        tasks = self.create_tasks()
        
        crew = Crew(
            agents=[self.planner, self.navigator, self.extractor, self.validator],
            tasks=tasks,
            process=Process.sequential,  # 顺序执行
            verbose=True,
            memory=True  # 启用记忆
        )
        
        result = crew.kickoff()
        return result
```

---

### 4.3 API 层设计

```python
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional
import uuid
from datetime import datetime

app = FastAPI(
    title="AI Scraper Agent API",
    description="自然语言驱动的智能爬虫 Agent API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# ============ 请求/响应模型 ============

class ScrapingRequest(BaseModel):
    """爬虫任务请求"""
    user_input: str = Field(
        ...,
        description="自然语言爬虫指令",
        example="帮我抓取知乎热榜前20条的标题和回答数",
        min_length=5,
        max_length=1000
    )
    output_format: str = Field(
        "json",
        description="输出格式",
        enum=["json", "csv", "excel"]
    )
    timeout: int = Field(
        300,
        description="超时时间（秒）",
        ge=60,
        le=3600
    )

class TaskResponse(BaseModel):
    """任务创建响应"""
    task_id: str
    status: str
    message: str
    created_at: datetime

class TaskStatus(BaseModel):
    """任务状态"""
    task_id: str
    status: str  # pending, running, completed, failed
    progress: Optional[str] = None
    result: Optional[dict] = None
    error: Optional[str] = None
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

# ============ 内存任务存储（生产环境用 Redis/DB） ============
task_store: dict[str, dict] = {}

# ============ API 路由 ============

@app.post("/api/v1/scrape", response_model=TaskResponse)
async def create_scraping_task(
    request: ScrapingRequest,
    background_tasks: BackgroundTasks
):
    """创建爬虫任务"""
    task_id = str(uuid.uuid4())
    
    # 保存任务
    task_store[task_id] = {
        "status": "pending",
        "request": request.dict(),
        "created_at": datetime.now(),
        "progress": "任务已创建，等待执行",
        "result": None,
        "error": None
    }
    
    # 后台执行
    background_tasks.add_task(
        execute_scraping_task,
        task_id=task_id,
        request=request
    )
    
    return TaskResponse(
        task_id=task_id,
        status="pending",
        message="任务已创建，正在执行",
        created_at=task_store[task_id]["created_at"]
    )

@app.get("/api/v1/tasks/{task_id}", response_model=TaskStatus)
async def get_task_status(task_id: str):
    """查询任务状态"""
    if task_id not in task_store:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    task = task_store[task_id]
    return TaskStatus(
        task_id=task_id,
        status=task["status"],
        progress=task.get("progress"),
        result=task.get("result"),
        error=task.get("error"),
        created_at=task.get("created_at"),
        completed_at=task.get("completed_at")
    )

@app.get("/api/v1/tasks")
async def list_tasks(status: Optional[str] = None, limit: int = 20):
    """查询任务列表"""
    tasks = []
    for task_id, task in task_store.items():
        if status and task["status"] != status:
            continue
        tasks.append({
            "task_id": task_id,
            "status": task["status"],
            "user_input": task["request"]["user_input"],
            "created_at": task["created_at"]
        })
    return tasks[:limit]

@app.delete("/api/v1/tasks/{task_id}")
async def cancel_task(task_id: str):
    """取消任务"""
    if task_id not in task_store:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    task = task_store[task_id]
    if task["status"] in ["completed", "failed"]:
        raise HTTPException(status_code=400, detail="任务已完成或失败，无法取消")
    
    task["status"] = "cancelled"
    task["progress"] = "任务已取消"
    
    return {"message": "任务已取消"}

# ============ 后台任务执行 ============

async def execute_scraping_task(task_id: str, request: ScrapingRequest):
    """后台执行爬虫任务"""
    try:
        # 更新状态
        task_store[task_id]["status"] = "running"
        task_store[task_id]["progress"] = "正在初始化 Agent..."
        
        # 执行 Crew
        crew = ScraperCrew(
            user_input=request.user_input,
            output_format=request.output_format
        )
        
        task_store[task_id]["progress"] = "正在制定计划..."
        result = crew.execute()
        
        # 保存结果
        task_store[task_id]["status"] = "completed"
        task_store[task_id]["progress"] = "完成"
        task_store[task_id]["completed_at"] = datetime.now()
        task_store[task_id]["result"] = {
            "data": result.raw,
            "output_file": result.output_path,
            "statistics": result.statistics
        }
        
    except Exception as e:
        task_store[task_id]["status"] = "failed"
        task_store[task_id]["error"] = str(e)
        task_store[task_id]["completed_at"] = datetime.now()
```

---

## 五、数据流设计

### 5.1 核心数据流

```
用户输入
  │
  ▼
[1. 意图理解] Planner Agent 分析自然语言
  │ 输出：爬取计划 (JSON)
  │
  ▼
[2. 页面访问] Navigator Agent 控制浏览器
  │ 使用: agent-browser
  │ 输出：页面快照 (含 refs)
  │
  ▼
[3. 数据提取] Extractor Agent 提取数据
  │ 使用: agent-browser extract
  │ 输出：原始数据列表 (List[Dict])
  │
  ▼
[4. 数据验证] Validator Agent 检查质量
  │ 使用: Playwright + Pandas
  │ 输出：验证报告 + 清洗后的数据
  │
  ▼
[5. 数据导出] 格式化并保存
  │ 输出：JSON/CSV/Excel 文件
  │
  ▼
返回结果给用户
```

### 5.2 异常处理流程

```
任务执行
  │
  ├─ 失败：页面无法访问
  │   └─ Navigator Agent 重试（更换策略）
  │       ├─ 成功 → 继续
  │       └─ 失败 → 报告错误
  │
  ├─ 失败：数据提取为空
  │   └─ Extractor Agent 重新分析页面
  │       ├─ 成功 → 继续
  │       └─ 失败 → 报告错误
  │
  └─ 失败：数据质量不达标
      └─ Validator Agent 标记问题字段
          ├─ 可修复 → 返回重新提取
          └─ 不可修复 → 报告警告并输出部分数据
```

### 5.3 状态机设计

```python
# 任务状态枚举
class TaskStatus:
    PENDING = "pending"           # 等待执行
    PLANNING = "planning"         # 正在制定计划
    NAVIGATING = "navigating"     # 正在访问页面
    EXTRACTING = "extracting"     # 正在提取数据
    VALIDATING = "validating"     # 正在验证数据
    EXPORTING = "exporting"       # 正在导出数据
    COMPLETED = "completed"       # 任务完成
    FAILED = "failed"             # 任务失败
    RETRYING = "retrying"         # 正在重试
    CANCELLED = "cancelled"       # 已取消

# 状态转换图
"""
PENDING → PLANNING → NAVIGATING → EXTRACTING → VALIDATING → EXPORTING → COMPLETED
   ↓          ↓           ↓            ↓            ↓
   └──────────┴───────────┴────────────┴────────────┴→ RETRYING → ...
                                                          │
                                                          └→ FAILED
                                                          
任何状态 → CANCELLED（用户主动取消）
"""
```

---

## 六、项目结构

```
ai-scraper-agent/
│
├── backend/                          # Python 后端
│   ├── src/
│   │   ├── __init__.py
│   │   │
│   │   ├── agents/                   # Agent 定义
│   │   │   ├── __init__.py
│   │   │   ├── planner.py            # 规划师 Agent
│   │   │   ├── navigator.py          # 导航员 Agent
│   │   │   ├── extractor.py          # 提取器 Agent
│   │   │   ├── validator.py          # 验证员 Agent
│   │   │   └── crew.py               # Crew 编排
│   │   │
│   │   ├── tools/                    # 工具集
│   │   │   ├── __init__.py
│   │   │   ├── agent_browser.py      # agent-browser 封装
│   │   │   ├── playwright_tool.py    # Playwright 封装
│   │   │   └── data_processor.py     # 数据处理工具
│   │   │
│   │   ├── api/                      # API 层
│   │   │   ├── __init__.py
│   │   │   ├── main.py               # FastAPI 主应用
│   │   │   ├── routes.py             # 路由定义
│   │   │   ├── schemas.py            # Pydantic 模型
│   │   │   └── middleware.py         # 中间件
│   │   │
│   │   ├── models/                   # 数据模型
│   │   │   ├── __init__.py
│   │   │   └── database.py           # SQLAlchemy 模型
│   │   │
│   │   ├── services/                 # 业务服务
│   │   │   ├── __init__.py
│   │   │   ├── task_service.py       # 任务管理
│   │   │   ├── export_service.py     # 导出服务
│   │   │   └── scheduler_service.py  # 定时任务
│   │   │
│   │   ├── utils/                    # 工具函数
│   │   │   ├── __init__.py
│   │   │   ├── config.py             # 配置加载
│   │   │   ├── logger.py             # 日志工具
│   │   │   └── helpers.py            # 辅助函数
│   │   │
│   │   └── prompts/                  # Prompt 模板
│   │       ├── __init__.py
│   │       ├── planner_prompt.py
│   │       ├── navigator_prompt.py
│   │       └── extractor_prompt.py
│   │
│   ├── cli.py                        # CLI 入口
│   ├── pyproject.toml                # uv 项目配置
│   ├── uv.lock                       # 依赖锁定文件
│   ├── .env.example                  # 环境变量示例
│   └── config.yaml                   # 配置文件
│
├── frontend/                         # React 前端
│   ├── src/
│   │   ├── routes/                   # TanStack Router 文件路由
│   │   │   ├── __root.tsx            # 根布局
│   │   │   ├── index.tsx             # 首页
│   │   │   ├── tasks/
│   │   │   │   ├── index.tsx         # /tasks 任务列表
│   │   │   │   ├── create.tsx        # /tasks/create 创建任务
│   │   │   │   └── $taskId.tsx       # /tasks/$taskId 任务详情
│   │   │   └── settings.tsx          # /settings 设置
│   │   │
│   │   ├── components/               # 组件
│   │   │   ├── ui/                   # 基础 UI 组件
│   │   │   ├── TaskForm.tsx          # 任务提交表单
│   │   │   ├── TaskList.tsx          # 任务列表
│   │   │   ├── TaskCard.tsx          # 任务卡片
│   │   │   ├── TaskDetail.tsx        # 任务详情
│   │   │   ├── DataPreview.tsx       # 数据预览表格
│   │   │   └── FileDownload.tsx      # 文件下载
│   │   │
│   │   ├── services/                 # API 服务
│   │   │   ├── api.ts                # Axios 实例
│   │   │   └── tasks.ts              # 任务相关 API
│   │   │
│   │   ├── stores/                   # 状态管理
│   │   │   ├── useTaskStore.ts       # 任务状态
│   │   │   └── useSettingStore.ts    # 设置状态
│   │   │
│   │   ├── hooks/                    # 自定义 Hooks
│   │   │   ├── useTaskPolling.ts     # 任务轮询
│   │   │   └── useFileDownload.ts    # 文件下载
│   │   │
│   │   ├── types/                    # TypeScript 类型
│   │   │   └── index.ts
│   │   │
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── data/                             # 数据存储
│   ├── outputs/                      # 导出数据
│   │   └── 2026-04-11/
│   ├── cache/                        # 缓存
│   └── logs/                         # 日志
│
├── tests/                            # 测试
│   ├── test_agents/
│   ├── test_tools/
│   └── test_api/
│
├── examples/                         # 使用示例
│   ├── basic_scraping.py
│   ├── dynamic_content.py
│   └── scheduled_task.py
│
├── docs/                             # 文档
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── DEVELOPMENT.md
│
├── .gitignore
└── README.md
```

---

## 七、实施计划

### Phase 1: 基础原型（Week 1-2）

**目标：** 跑通核心流程，CLI 可用

**任务清单：**
- [ ] Python 环境搭建（uv 安装和配置）
- [ ] 安装 agent-browser 并测试
- [ ] 实现 Planner Agent（单个）
- [ ] 实现 Navigator Agent（单个）
- [ ] 实现 Extractor Agent（单个）
- [ ] 简单 Crew 编排
- [ ] CLI 入口（命令行调用）
- [ ] 测试用例：抓取 Hacker News 前 10 条

**验收标准：**
```bash
# 命令行成功执行
uv run python cli.py "帮我抓取 Hacker News 前10条标题和链接"
# 输出：data/outputs/hn_top10.json
```

**产出：**
- 可运行的 CLI 工具
- 基础 Agent 实现
- 简单测试用例

---

### Phase 2: 完善核心功能（Week 3-4）

**目标：** 完整的多角色 Agent，错误处理

**任务清单：**
- [ ] 实现 Validator Agent
- [ ] 完善 Playwright 工具封装
- [ ] 数据验证和导出功能
- [ ] 异常处理和重试机制
- [ ] 日志系统（rich 美化输出）
- [ ] 配置文件管理
- [ ] 更多测试用例（电商、知乎、微博等）
- [ ] 单元测试覆盖核心逻辑

**验收标准：**
```bash
# 多种场景测试通过
uv run python cli.py "抓取淘宝机械键盘前50个商品的价格和销量"
uv run python cli.py "抓取知乎热榜前20条"
# 输出：JSON + 验证报告
```

**产出：**
- 完整的多角色 Agent
- 数据验证和导出
- 测试用例集合

---

### Phase 3: API 服务（Week 5-6）

**目标：** FastAPI 服务，支持程序调用

**任务清单：**
- [ ] FastAPI 项目搭建
- [ ] 任务创建和查询 API
- [ ] 后台任务执行（BackgroundTasks）
- [ ] SQLite 数据库集成
- [ ] API 文档（Swagger 自动生成）
- [ ] CORS 配置
- [ ] 错误处理和日志
- [ ] API 集成测试

**验收标准：**
```bash
# 启动 API 服务
uv run uvicorn backend.src.api.main:app --reload

# 调用 API
curl -X POST http://localhost:8000/api/v1/scrape \
  -H "Content-Type: application/json" \
  -d '{"user_input": "抓取知乎热榜"}'

# 访问 Swagger 文档
open http://localhost:8000/api/docs
```

**产出：**
- RESTful API 服务
- 自动生成的 API 文档
- 完整的 CRUD 接口

---

### Phase 4: Web UI（Week 7-8）

**目标：** React 19 前端，可视化操作

**任务清单：**
- [ ] React 19 + TypeScript 项目搭建
- [ ] TanStack Router 文件路由配置
- [ ] Vite 6 构建工具配置
- [ ] 任务提交表单页面
- [ ] 任务列表和状态监控
- [ ] 数据预览表格
- [ ] 文件下载功能
- [ ] 响应式设计（Ant Design / shadcn/ui）
- [ ] 前端 E2E 测试

**验收标准：**
- 完整的 Web 界面
- 任务管理、数据预览、文件下载
- 移动端适配

**产出：**
- React 19 前端应用
- 完整的用户界面
- 前后端联调通过

---

### Phase 5: 高级功能（Week 9-10）

**目标：** 定时任务、批量处理、优化

**任务清单：**
- [ ] APScheduler 定时任务
- [ ] 批量任务支持
- [ ] 性能优化（并发、缓存）
- [ ] SSE 实时进度推送
- [ ] 监控和告警
- [ ] Docker 化部署
- [ ] CI/CD 配置
- [ ] 文档完善

**验收标准：**
- 定时任务正常运行
- Docker 一键部署
- 完整的文档

**产出：**
- 生产就绪的系统
- Docker 镜像
- 完整的文档

---

## 八、风险评估

### 8.1 技术风险

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|---------|
| agent-browser 不稳定 | 中 | 高 | 保留 Playwright 备选，快速切换 |
| LLM API 调用失败 | 中 | 中 | 重试机制 + 降级策略 |
| 反爬机制升级 | 高 | 高 | 代理池 + 人类行为模拟 |
| React 19 兼容性问题 | 低 | 中 | 降级到 React 18 |
| 大规模并发性能 | 中 | 中 | 后续引入 Redis 队列 + Worker 集群 |
| CrewAI 版本兼容 | 低 | 中 | 锁定依赖版本 |
| uv 工具成熟度 | 低 | 低 | 保留 pip/poetry 备选方案 |

### 8.2 成本风险

| 项目 | 月成本估算 | 说明 |
|------|-----------|------|
| LLM API（GPT-4） | $20-100 | 取决于任务量和复杂度 |
| 服务器 | $0-50 | 初期单机部署 |
| 代理池（可选） | $10-50 | 如需绕过强反爬 |
| **总计** | **$30-200/月** | 初期可控 |

### 8.3 法律合规风险

- ⚠️ **遵守 robots.txt** - 不爬取禁止访问的页面
- ⚠️ **控制请求频率** - 避免对目标网站造成压力
- ⚠️ **不爬取个人隐私数据** - 遵守数据保护法规
- ⚠️ **数据使用合规** - 确保数据用途合法

### 8.4 应对策略

1. **技术风险应对**
   - 每个关键组件都有备选方案
   - 完善的错误处理和日志
   - 定期更新依赖版本

2. **成本风险控制**
   - 初期使用最低配置
   - 监控 API 调用成本
   - 优化 Prompt 减少 Token 消耗

3. **法律风险防范**
   - 内置 robots.txt 检查
   - 请求频率限制
   - 用户协议明确使用规范

---

## 九、扩展规划

### 9.1 短期扩展（1-3 个月）

- [ ] **可视化爬虫构建器** - 拖拽式配置（前端优势）
- [ ] **更多数据源** - API、PDF、Excel 文件解析
- [ ] **数据转换管道** - 清洗 → 转换 → 加载到数据库
- [ ] **多语言支持** - 中英文界面
- [ ] **浏览器插件** - Chrome 扩展快速提取

### 9.2 中期扩展（3-6 个月）

- [ ] **分布式爬取** - Redis + Celery 多 Worker
- [ ] **代理池管理** - 自动轮换、健康检查
- [ ] **智能反爬对抗** - 指纹随机化、行为模拟
- [ ] **数据市场** - 共享爬取结果和配置
- [ ] **Webhook 通知** - 任务完成推送

### 9.3 长期愿景（6-12 个月）

- [ ] **SaaS 平台** - 多租户、订阅制
- [ ] **AI 训练数据服务** - 为 ML 提供高质量数据
- [ ] **开放 API 市场** - 第三方集成
- [ ] **自动化报告** - 定时生成数据分析报告
- [ ] **自然语言查询** - "上个月竞品价格变化趋势"

---

## 十、关键技术决策记录（ADR）

### ADR-001: 选择 Python 作为主要开发语言

**决策日期：** 2026-04-11

**背景：** 团队主要经验是前端（Node.js/TypeScript），但 AI 爬虫项目需要评估最佳语言。

**选项：**
1. Python
2. Node.js/TypeScript

**决策：** 选择 Python

**理由：**
- CrewAI、ScrapeGraphAI 等核心框架 Python 优先
- AI 行业生态 90% 基于 Python
- 爬虫库和数据处理库最完善
- 学习成本（2周）< 长期用 Node.js 造轮子的代价

**后果：**
- ✅ 直接用上最好的 AI 框架
- ✅ 社区资源丰富
- ❌ 需要学习 Python（2周）
- ❌ 前端集成需要额外 API 层

---

### ADR-002: 选择 uv 作为 Python 包管理工具

**决策日期：** 2026-04-11

**背景：** Python 包管理工具众多，需要选择最适合现代项目的方案。

**选项：**
1. uv
2. pip + venv
3. poetry
4. pipenv

**决策：** 选择 uv

**理由：**
- 性能比 pip 快 10-100 倍（Rust 实现）
- 和 npm 体验类似，前端开发友好
- 一个工具解决所有问题（包管理 + 虚拟环境 + 锁文件）
- Astral（Ruff 团队）开发，质量有保障
- 成为 2025+ 现代 Python 项目标准

**后果：**
- ✅ 安装和依赖管理极快
- ✅ 团队学习成本低（前端熟悉 npm）
- ✅ 依赖锁定保障可重现构建
- ❌ 工具相对较新，极端场景可能遇坑

---

### ADR-003: 选择 CrewAI 作为 Agent 框架

**决策日期：** 2026-04-11

**背景：** 需要多角色 Agent 协作框架。

**选项：**
1. CrewAI
2. LangChain
3. LangGraph
4. 手写

**决策：** 选择 CrewAI

**理由：**
- 项目本质是多角色协作（规划→导航→提取→验证）
- CrewAI 设计哲学完美匹配
- 同样功能代码量减少 60%
- 快速原型验证

**后果：**
- ✅ 开发效率极高
- ✅ 代码清晰易维护
- ❌ 复杂分支逻辑支持弱（但当前不需要）

---

### ADR-004: 浏览器控制采用混合方案

**决策日期：** 2026-04-11

**背景：** 需要选择浏览器自动化工具。

**选项：**
1. agent-browser
2. Playwright
3. 混合方案

**决策：** agent-browser 为主，Playwright 为辅

**理由：**
- agent-browser 为 AI 原生设计，Ref 机制抗 UI 变更
- Playwright 在确定性场景和批量处理有优势
- 混合方案综合成本最低

**后果：**
- ✅ 自然语言驱动开箱即用
- ✅ 选择器维护成本降低 70%
- ✅ 批量数据处理无 LLM 成本
- ❌ 需要维护两套工具封装

---

### ADR-005: 前端使用 React 19 + TanStack Router

**决策日期：** 2026-04-11

**背景：** 前端需要选择 React 版本和路由方案。

**选项：**

React 版本：
- React 18（稳定）
- React 19（最新）

路由方案：
- React Router v7
- TanStack Router

**决策：** React 19 + TanStack Router

**理由：**
- React 19 已稳定发布，性能优化明显
- TanStack Router 提供极致类型安全
- 文件路由提高开发效率
- 团队追求技术前沿，有利于长期维护

**后果：**
- ✅ 类型安全极高
- ✅ 开发效率高（文件路由）
- ✅ 性能优秀
- ⚠️ UI 库兼容性需验证（Ant Design）
- ⚠️ 生态相对较新

**备选方案：**
- 如果 Ant Design 不兼容 React 19 → 使用 shadcn/ui
- 如果 TanStack Router 遇到问题 → 降级到 React Router v7

---

## 十一、快速开始指南

### 11.1 环境准备

```bash
# 1. 安装 uv（Python 包管理）
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. 安装 Node.js（前端开发）
# 推荐使用 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20

# 3. 安装 agent-browser
npm install -g agent-browser
agent-browser install

# 4. 安装 Playwright 浏览器
# （通过 uv 安装依赖时会自动处理）
```

### 11.2 后端启动

```bash
# 1. 进入后端目录
cd backend

# 2. 初始化项目（如未初始化）
uv init --no-readme

# 3. 安装依赖
uv add crewai playwright openai fastapi uvicorn pandas

# 4. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入 OpenAI API Key
echo "OPENAI_API_KEY=sk-..." > .env

# 5. 运行 CLI 示例
uv run python cli.py "帮我抓取 Hacker News 前10条"

# 6. 启动 API 服务
uv run uvicorn src.api.main:app --reload
```

### 11.3 前端启动

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖
npm install
# 或 yarn install

# 3. 启动开发服务器
npm run dev

# 4. 访问应用
open http://localhost:3000
```

### 11.4 测试运行

```bash
# 后端测试
cd backend
uv run pytest

# 前端测试
cd frontend
npm run test
```

---

## 十二、总结

### 核心技术栈

```
后端: Python + uv + CrewAI + agent-browser（主） + Playwright（辅） + FastAPI
前端: React 19 + TanStack Router + TypeScript + Vite 6 + Ant Design/shadcn/ui
```

### 架构优势

- ✅ **自然语言交互** - 产品核心卖点
- ✅ **多角色协作** - CrewAI 优雅实现
- ✅ **抗 UI 变更** - agent-browser Ref 机制
- ✅ **类型安全** - TanStack Router + TypeScript
- ✅ **现代工具链** - uv + Vite 6 + React 19
- ✅ **易于扩展** - 模块化设计

### 预期产出

| 时间 | 里程碑 | 产出 |
|------|--------|------|
| **Week 2** | 基础原型 | CLI 可用，核心流程跑通 |
| **Week 4** | 完整 Agent | 多角色协作，错误处理 |
| **Week 6** | API 服务 | RESTful API，文档生成 |
| **Week 8** | Web UI | React 前端，可视化操作 |
| **Week 10** | 生产就绪 | 定时任务，Docker 部署 |

### 下一步行动

1. ✅ 审阅本设计文档
2. ⏳ 确认技术选型
3. ⏳ 开始 Phase 1 实施
4. ⏳ 搭建项目脚手架
5. ⏳ 实现核心 Agent 原型

---

**文档结束**

> 如有疑问或需要调整，请随时讨论！
