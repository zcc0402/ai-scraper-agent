"""统一 LLM 适配器 - 使用 litellm 支持所有主流模型

litellm 会自动根据 endpoint 选择正确的 API 格式 (OpenAI/Anthropic/百炼)
"""

import os
from typing import Optional
from src.utils.config import settings


def get_llm(model: Optional[str] = None, temperature: float = 0.7):
    """
    获取 LLM 实例
    
    使用 litellm 统一适配，返回 CrewAI 兼容的 LLM 对象
    
    Args:
        model: 模型名称
        temperature: 温度参数 (0-1)
        
    Returns:
        LLM 实例 (兼容 CrewAI)
    """
    from crewai import LLM
    
    model_name = model or settings.OPENAI_MODEL
    api_key = settings.OPENAI_API_KEY
    base_url = settings.OPENAI_BASE_URL
    
    # 如果 base_url 包含 anthropic，说明是百炼的 Anthropic 兼容模式
    # 需要告诉 litellm 使用 anthropic 格式
    if base_url and "anthropic" in base_url.lower():
        # 使用 anthropic/ 前缀让 litellm 知道使用 Anthropic API 格式
        full_model = f"anthropic/{model_name}"
    else:
        full_model = model_name
    
    # 构建 LLM 配置
    llm_config = {
        "model": full_model,
        "temperature": temperature,
        "api_key": api_key,
    }
    
    if base_url:
        llm_config["base_url"] = base_url
    
    # 创建 LLM 实例
    return LLM(**llm_config)


# 全局 LLM 实例
_llm_instance = None


def get_default_llm():
    """获取默认的 LLM 实例（单例）"""
    global _llm_instance
    if _llm_instance is None:
        _llm_instance = get_llm()
    return _llm_instance
