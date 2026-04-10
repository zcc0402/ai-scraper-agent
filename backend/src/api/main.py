"""FastAPI 主应用入口"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from src.utils.config import settings
from src.api.routes import router

# 配置日志
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format=settings.LOG_FORMAT if hasattr(settings, 'LOG_FORMAT') else "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

# 创建 FastAPI 实例
app = FastAPI(
    title="AI Scraper Agent API",
    description="自然语言驱动的智能爬虫 API 服务",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(router)


@app.get("/", tags=["根路径"])
async def root():
    """API 根路径"""
    return {
        "service": "AI Scraper Agent API",
        "version": "0.1.0",
        "status": "running",
        "docs": "/api/docs"
    }


@app.get("/health", tags=["健康检查"])
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "version": "0.1.0"
    }


@app.on_event("startup")
async def startup_event():
    """应用启动时执行"""
    logger.info("🚀 AI Scraper Agent API 启动中...")
    settings.ensure_directories()
    logger.info(f"📂 数据目录已就绪")


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时执行"""
    logger.info("👋 AI Scraper Agent API 正在关闭...")
