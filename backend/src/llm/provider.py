"""统一 LLM 适配器 - 支持 OpenAI / Anthropic / 百炼

使用 litellm 统一适配，让 CrewAI 只需要对接一种格式
"""

import os
from typing import Optional
from src.utils.config import settings


def get_llm(model: Optional[str] = None, temperature: float = 0.7):
    """
    获取 LLM 实例
    
    根据 LLM_PROVIDER 自动选择 OpenAI 或 Anthropic 客户端
    百炼的 Anthropic 兼容模式也走这里
    
    Args:
        model: 模型名称
        temperature: 温度参数 (0-1)
        
    Returns:
        LLM 实例 (兼容 CrewAI)
    """
    model_name = model or settings.OPENAI_MODEL
    provider = settings.LLM_PROVIDER.lower()
    api_key = settings.OPENAI_API_KEY
    base_url = settings.OPENAI_BASE_URL
    
    # 如果是 Anthropic 提供商（包括百炼的 Anthropic 兼容模式）
    if provider == "anthropic" or "anthropic" in (base_url or "").lower():
        from langchain_anthropic import ChatAnthropic
        
        return ChatAnthropic(
            model=model_name,
            temperature=temperature,
            anthropic_api_key=api_key,
            base_url=base_url,
        )
    
    # 默认使用 OpenAI 兼容格式
    else:
        from langchain_openai import ChatOpenAI
        
        kwargs = {
            "model": model_name,
            "temperature": temperature,
            "api_key": api_key,
        }
        
        if base_url:
            kwargs["base_url"] = base_url
        
        return ChatOpenAI(**kwargs)


# 全局 LLM 实例
_llm_instance = None


def get_default_llm():
    """获取默认的 LLM 实例（单例）"""
    global _llm_instance
    if _llm_instance is None:
        _llm_instance = get_llm()
    return _llm_instance
