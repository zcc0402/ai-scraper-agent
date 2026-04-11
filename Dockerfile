# 多阶段构建

# 阶段 1: 前端构建
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY frontend/ ./
RUN pnpm run build

# 阶段 2: Python 后端
FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 安装 uv
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"

# 复制后端文件
COPY backend/pyproject.toml ./
COPY backend/.python-version ./

# 安装 Python 依赖
RUN uv sync --no-dev

# 复制后端代码
COPY backend/ ./

# 复制前端构建产物
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# 安装 Playwright 浏览器
RUN .venv/bin/python -m playwright install --with-deps chromium

# 创建数据目录
RUN mkdir -p data/outputs data/cache data/logs

# 暴露端口
EXPOSE 8000

# 启动命令
CMD [".venv/bin/uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
