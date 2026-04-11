"""统一 LLM 适配器 - 使用 litellm 支持所有主流模型

litellm 会把所有模型调用统一转换为 OpenAI 格式
这样 CrewAI 只需要对接一种格式，配置极其简单

支持的提供商：
- OpenAI (gpt-4, gpt-3.5-turbo)
- Anthropic / 百炼 (claude-*, qwen-*)
- 其他任何 litellm 支持的模型
"""

import os
from typing import Optional
from langchain_openai import ChatOpenAI
from src.utils.config import settings


def get_llm(
    model: Optional[str] = None,
    temperature: float = 0.7
) -> ChatOpenAI:
    """
    获取 LLM 实例
    
    使用 litellm 统一适配，返回 ChatOpenAI 实例
    CrewAI 可以直接使用，无需关心底层是哪个模型
    
    Args:
        model: 模型名称（覆盖配置中的默认值）
        temperature: 温度参数 (0-1)
        
    Returns:
        ChatOpenAI 实例
    """
    model_name = model or settings.OPENAI_MODEL
    api_key = settings.OPENAI_API_KEY
    base_url = settings.OPENAI_BASE_URL
    
    # litellm 会通过 OpenAI 兼容层自动处理所有模型
    # 只需要配置正确的 base_url 和 api_key
    return ChatOpenAI(
        model=model_name,
        temperature=temperature,
        openai_api_key=api_key,
        openai_api_base=base_url,
    )


# 全局 LLM 实例（延迟初始化）
_llm_instance: Optional[ChatOpenAI] = None


def get_default_llm() -> ChatOpenAI:
    """获取默认的 LLM 实例（单例）"""
    global _llm_instance
    if _llm_instance is None:
        _llm_instance = get_llm()
    return _llm_instance
