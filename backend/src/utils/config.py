"""应用配置管理"""

import os
from pathlib import Path
from typing import Optional, Literal
from pydantic import Field
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()


class Settings(BaseSettings):
    """应用配置"""
    
    # LLM 配置
    LLM_PROVIDER: Literal["openai", "anthropic", "dashscope"] = Field(
        default="openai",
        description="LLM 提供商类型"
    )
    OPENAI_API_KEY: str = Field(..., description="API Key（兼容 OpenAI 格式）")
    OPENAI_MODEL: str = Field(default="claude-3-opus-20240229", description="模型名称")
    OPENAI_BASE_URL: Optional[str] = Field(
        default=None,
        description="API 基础 URL（用于兼容 OpenAI 格式的端点）"
    )
    
    # 应用配置
    APP_ENV: str = Field(default="development", description="运行环境")
    APP_DEBUG: bool = Field(default=False, description="调试模式")
    LOG_LEVEL: str = Field(default="INFO", description="日志级别")
    
    # 数据库配置
    DATABASE_URL: str = Field(
        default="sqlite:///./data/scraper.db",
        description="数据库连接字符串"
    )
    
    # 文件存储路径
    DATA_OUTPUT_DIR: str = Field(
        default="./data/outputs",
        description="数据输出目录"
    )
    DATA_CACHE_DIR: str = Field(
        default="./data/cache",
        description="缓存目录"
    )
    DATA_LOG_DIR: str = Field(
        default="./data/logs",
        description="日志目录"
    )
    
    # API 配置
    API_HOST: str = Field(default="0.0.0.0", description="API 监听地址")
    API_PORT: int = Field(default=8000, description="API 端口")
    API_CORS_ORIGINS: str = Field(
        default="http://localhost:3000,http://localhost:5173",
        description="CORS 允许的源"
    )
    
    # 爬虫配置
    SCRAPER_TIMEOUT: int = Field(default=300, description="爬虫超时时间（秒）")
    SCRAPER_MAX_RETRIES: int = Field(default=3, description="最大重试次数")
    SCRAPER_REQUEST_DELAY: float = Field(default=1.0, description="请求间隔（秒）")
    
    # agent-browser 配置
    AGENT_BROWSER_PATH: str = Field(default="agent-browser", description="agent-browser 路径")
    AGENT_BROWSER_TIMEOUT: int = Field(default=60, description="agent-browser 超时时间")
    AI_GATEWAY_API_KEY: Optional[str] = Field(default=None, description="AI Gateway API Key (agent-browser chat 需要)")
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def cors_origins_list(self) -> list[str]:
        """获取 CORS 源列表"""
        return [origin.strip() for origin in self.API_CORS_ORIGINS.split(",")]
    
    def ensure_directories(self):
        """确保数据目录存在"""
        Path(self.DATA_OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
        Path(self.DATA_CACHE_DIR).mkdir(parents=True, exist_ok=True)
        Path(self.DATA_LOG_DIR).mkdir(parents=True, exist_ok=True)


# 全局配置实例
settings = Settings()
