# AI Scraper Agent - 自然语言驱动的智能爬虫

> 用自然语言描述你想抓取的数据，AI 自动完成爬取任务

[![GitHub stars](https://img.shields.io/github/stars/zcc0402/ai-scraper-agent)](https://github.com/zcc0402/ai-scraper-agent/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/react-19-blue.svg)](https://react.dev/)

---

## ✨ 特性

- 🗣️ **自然语言交互** - 无需写代码/选择器，说话就能爬虫
- 🤖 **多角色 AI 协作** - 规划→导航→提取→验证，智能分工
- 🎯 **智能抗 UI 变更** - Ref 机制保障长期稳定运行
- 📊 **结构化数据输出** - 自动导出 JSON/CSV/Excel
- 🕒 **定时任务调度** - 支持 Cron 表达式和间隔循环
- 🐳 **Docker 一键部署** - 完整容器化配置
- 📱 **响应式 Web UI** - React 19 + Ant Design

---

## 🚀 快速开始

### 方式一：本地开发

#### 1. 环境要求

- Python 3.11+
- Node.js 20+
- [uv](https://github.com/astral-sh/uv) (Python 包管理)
- [pnpm](https://pnpm.io/) (前端包管理)

#### 2. 安装

```bash
# 克隆项目
git clone https://github.com/zcc0402/ai-scraper-agent.git
cd ai-scraper-agent

# 安装 agent-browser
npm install -g agent-browser
agent-browser install

# 安装后端依赖
cd backend
uv sync

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 OpenAI API Key

# 安装前端依赖
cd ../frontend
pnpm install
```

#### 3. 运行

```bash
# 后端 CLI 模式
cd backend
uv run python cli.py "帮我抓取 Hacker News 前10条标题"

# 后端 API 服务
uv run uvicorn src.api.main:app --reload
# 访问 http://localhost:8000/api/docs

# 前端开发服务器
cd frontend
pnpm run dev
# 访问 http://localhost:3000
```

---

### 方式二：Docker 部署

```bash
# 开发环境
docker-compose --profile dev up -d

# 生产环境
docker-compose --profile prod up -d

# 查看日志
docker-compose logs -f api

# 停止服务
docker-compose down
```

---

## 📁 项目结构

```
ai-scraper-agent/
├── backend/                  # Python 后端
│   ├── src/
│   │   ├── agents/           # AI Agent 定义
│   │   │   ├── planner.py    # 规划师
│   │   │   ├── navigator.py  # 导航员
│   │   │   ├── extractor.py  # 提取器
│   │   │   ├── validator.py  # 验证员
│   │   │   └── crew.py       # Crew 编排
│   │   ├── tools/            # 工具集
│   │   │   └── agent_browser.py
│   │   ├── api/              # FastAPI 服务
│   │   ├── models/           # 数据库模型
│   │   ├── services/         # 业务服务
│   │   │   ├── task_service.py
│   │   │   └── scheduler.py  # 定时任务
│   │   └── utils/            # 工具函数
│   ├── cli.py                # CLI 入口
│   └── pyproject.toml        # uv 配置
│
├── frontend/                 # React 前端
│   ├── src/
│   │   ├── routes/           # TanStack Router 文件路由
│   │   ├── pages/            # 页面组件
│   │   ├── components/       # 通用组件
│   │   ├── stores/           # Zustand 状态管理
│   │   └── services/         # API 服务
│   └── package.json
│
├── Dockerfile                # Docker 镜像
├── docker-compose.yml        # Docker Compose
├── nginx.conf                # Nginx 配置
└── DESIGN.md                 # 完整设计文档
```

---

## 📖 使用示例

### CLI 模式

```bash
# 基础爬虫
uv run python cli.py "抓取知乎热榜前20条标题"

# 指定输出格式
uv run python cli.py "抓取淘宝机械键盘前50个商品" --format csv

# 指定输出目录
uv run python cli.py "抓取 GitHub Trending" -o ./my-data
```

### API 调用

```bash
# 创建任务
curl -X POST http://localhost:8000/api/v1/scrape \
  -H "Content-Type: application/json" \
  -d '{"user_input": "抓取 GitHub Trending", "output_format": "json"}'

# 查询任务状态
curl http://localhost:8000/api/v1/tasks/{task_id}

# 查询任务列表
curl http://localhost:8000/api/v1/tasks?limit=10
```

### Web UI

1. 启动后端 API 服务
2. 启动前端开发服务器 `pnpm run dev`
3. 打开浏览器访问 http://localhost:3000
4. 在首页输入自然语言指令创建任务

---

## 🛠 技术栈

### 后端
| 组件 | 技术 | 说明 |
|------|------|------|
| 语言 | Python 3.11+ | AI/爬虫生态完善 |
| 包管理 | uv | 比 pip 快 10-100 倍 |
| Agent 框架 | CrewAI | 多角色 AI 协作 |
| 浏览器控制 | agent-browser | AI 原生，Ref 机制 |
| 浏览器控制 | Playwright | 确定性数据处理 |
| API | FastAPI | 异步，自动文档 |
| 数据库 | SQLite + SQLAlchemy | 轻量级 |
| 定时任务 | APScheduler | Cron/间隔调度 |

### 前端
| 组件 | 技术 | 说明 |
|------|------|------|
| 框架 | React 19 | 最新稳定版 |
| 路由 | TanStack Router | 文件路由，类型安全 |
| UI 库 | Ant Design 5 | 企业级组件库 |
| 状态管理 | Zustand | 轻量级 |
| 构建工具 | Vite 6 | 极速 HMR |
| 包管理 | pnpm | 高效依赖管理 |

---

## 📋 开发计划

- [x] Phase 1: 项目脚手架搭建
- [x] Phase 2: 核心 Agent 逻辑
- [x] Phase 3: FastAPI API 服务
- [x] Phase 4: Web UI
- [x] Phase 5: 高级功能 (定时任务、Docker)
- [ ] Phase 6: 分布式爬取 (Redis + Celery)
- [ ] Phase 7: 代理池管理
- [ ] Phase 8: SaaS 平台

---

## ⚠️ 注意事项

- 遵守目标网站的 `robots.txt` 和使用条款
- 控制请求频率，避免对网站造成压力
- 不爬取个人隐私数据
- 确保数据使用符合法律法规

---

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📧 联系方式

- GitHub: https://github.com/zcc0402/ai-scraper-agent
- 文档: [DESIGN.md](DESIGN.md)
