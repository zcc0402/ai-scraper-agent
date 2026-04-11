"""LLM 配置管理 API"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, Literal

from src.utils.config import settings

router = APIRouter(prefix="/api/v1/llm", tags=["LLM 配置"])


class LLMConfig(BaseModel):
    """LLM 配置模型"""
    provider: Literal["openai", "anthropic", "dashscope"] = Field(
        ..., description="LLM 提供商类型"
    )
    api_key: str = Field(..., description="API Key")
    model: str = Field(..., description="模型名称")
    base_url: Optional[str] = Field(None, description="API 基础 URL")


class LLMConfigResponse(BaseModel):
    """LLM 配置响应"""
    provider: str
    model: str
    base_url: Optional[str] = None
    api_key_masked: str  # 只显示前 8 位


@router.get("/config", response_model=LLMConfigResponse)
async def get_llm_config():
    """获取当前 LLM 配置"""
    api_key = settings.OPENAI_API_KEY
    masked_key = api_key[:8] + "..." + api_key[-4:] if len(api_key) > 12 else "****"
    
    return LLMConfigResponse(
        provider=settings.LLM_PROVIDER,
        model=settings.OPENAI_MODEL,
        base_url=settings.OPENAI_BASE_URL,
        api_key_masked=masked_key
    )


@router.post("/config")
async def update_llm_config(config: LLMConfig):
    """更新 LLM 配置"""
    # 这里可以保存到配置文件或数据库
    # 暂时只返回成功，实际应用中需要持久化
    return {
        "message": "LLM 配置已更新",
        "config": {
            "provider": config.provider,
            "model": config.model,
            "base_url": config.base_url
        }
    }


@router.get("/providers")
async def list_llm_providers():
    """获取支持的 LLM 提供商列表"""
    return {
        "providers": [
            {
                "id": "openai",
                "name": "OpenAI",
                "models": ["gpt-4o", "gpt-4", "gpt-3.5-turbo"]
            },
            {
                "id": "anthropic",
                "name": "Anthropic",
                "models": ["claude-3-opus-20240229", "claude-3-sonnet-20240229"]
            },
            {
                "id": "dashscope",
                "name": "阿里云百炼",
                "models": ["qwen3.6-plus", "qwen-max", "qwen-plus"]
            }
        ]
    }
