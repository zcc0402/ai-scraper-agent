# AI Scraper Agent - 自然语言驱动的智能爬虫

> 用自然语言描述你想抓取的数据，AI 自动完成爬取任务

## ✨ 特性

- 🗣️ **自然语言交互** - 无需写代码/选择器，说话就能爬虫
- 🤖 **多角色 AI 协作** - 规划→导航→提取→验证，智能分工
- 🎯 **智能抗 UI 变更** - Ref 机制保障长期稳定运行
- 📊 **结构化数据输出** - 自动导出 JSON/CSV/Excel
- 🚀 **现代技术栈** - Python + CrewAI + React 19 + TanStack Router

## 🚀 快速开始

### 环境要求

- Python 3.11+
- Node.js 20+
- [uv](https://github.com/astral-sh/uv) (Python 包管理)

### 安装

```bash
# 1. 安装 uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. 安装 agent-browser
npm install -g agent-browser
agent-browser install

# 3. 安装后端依赖
cd backend
uv sync

# 4. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 OpenAI API Key

# 5. 安装前端依赖
cd ../frontend
npm install
```

### 运行

```bash
# 后端 CLI 模式
cd backend
uv run python cli.py "帮我抓取 Hacker News 前10条标题"

# 后端 API 服务
uv run uvicorn src.api.main:app --reload

# 前端开发服务器
cd frontend
npm run dev
```

## 📁 项目结构

```
ai-scraper-agent/
├── backend/              # Python 后端
│   ├── src/
│   │   ├── agents/       # AI Agent 定义
│   │   ├── tools/        # 工具集
│   │   ├── api/          # FastAPI 服务
│   │   └── ...
│   ├── cli.py            # CLI 入口
│   └── pyproject.toml    # uv 配置
│
├── frontend/             # React 前端
│   ├── src/
│   │   ├── routes/       # TanStack Router 文件路由
│   │   ├── components/   # React 组件
│   │   └── ...
│   └── package.json
│
└── DESIGN.md             # 完整设计文档
```

## 📖 文档

- [完整设计文档](./DESIGN.md) - 技术选型、架构设计、实施计划
- [API 文档](http://localhost:8000/api/docs) - Swagger UI (运行 API 服务后访问)

## 🛠 技术栈

### 后端
- **语言**: Python 3.11+
- **包管理**: uv
- **Agent 框架**: CrewAI
- **浏览器控制**: agent-browser (主) + Playwright (辅)
- **API**: FastAPI
- **数据库**: SQLite + SQLAlchemy

### 前端
- **框架**: React 19
- **路由**: TanStack Router
- **UI 库**: Ant Design 5
- **状态管理**: Zustand + TanStack Query
- **构建工具**: Vite 6

## 📋 开发计划

- [x] Phase 1: 项目脚手架搭建 (Week 1-2)
- [ ] Phase 2: 核心 Agent 实现 (Week 3-4)
- [ ] Phase 3: API 服务 (Week 5-6)
- [ ] Phase 4: Web UI (Week 7-8)
- [ ] Phase 5: 高级功能 (Week 9-10)

## 📝 使用示例

```bash
# 示例 1: 基础爬虫
python cli.py "抓取知乎热榜前20条标题"

# 示例 2: 指定输出格式
python cli.py "抓取淘宝机械键盘前50个商品" --format csv

# 示例 3: API 调用
curl -X POST http://localhost:8000/api/v1/scrape \
  -H "Content-Type: application/json" \
  -d '{"user_input": "抓取 GitHub Trending"}'
```

## ⚠️ 注意事项

- 遵守目标网站的 robots.txt 和使用条款
- 控制请求频率，避免对网站造成压力
- 不爬取个人隐私数据
- 确保数据使用符合法律法规

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
