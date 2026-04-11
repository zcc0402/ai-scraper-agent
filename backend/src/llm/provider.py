"""统一 LLM 适配器 - 完美适配百炼 (Anthropic 兼容模式)

使用原生 anthropic SDK，确保与 Claude Code 行为一致
"""

import os
from typing import Optional, Any
from src.utils.config import settings


class BailianChatWrapper:
    """
    百炼 API 包装器 (Anthropic 兼容模式)
    实现 LangChain 兼容的接口，以便 CrewAI 可以使用
    """
    
    def __init__(self, model: str, temperature: float, api_key: str, base_url: str):
        from anthropic import Anthropic
        
        self.model = model
        self.temperature = temperature
        self.client = Anthropic(
            api_key=api_key,
            base_url=base_url
        )

    def invoke(self, prompt: str, **kwargs) -> Any:
        """
        调用 LLM
        返回一个兼容的对象，具有 .content 属性
        """
        message = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            temperature=self.temperature,
            messages=[{"role": "user", "content": prompt}]
        )
        
        # 提取文本内容（兼容 ThinkingBlock 和 TextBlock）
        text_parts = []
        for block in message.content:
            if hasattr(block, 'text'):
                text_parts.append(block.text)
            elif hasattr(block, 'thinking'):
                text_parts.append(block.thinking)
        
        full_content = "\n".join(text_parts) if text_parts else str(message.content)
        
        # 返回一个简单对象模拟 LangChain 的 AIMessage
        class Result:
            content = full_content
            
        return Result()


def get_llm(model: Optional[str] = None, temperature: float = 0.7):
    """
    获取 LLM 实例
    
    针对百炼优化：直接使用原生 Anthropic 客户端
    """
    model_name = model or settings.OPENAI_MODEL
    api_key = settings.OPENAI_API_KEY
    base_url = settings.OPENAI_BASE_URL
    
    # 如果配置了 base_url，说明是使用兼容模式（如百炼）
    if base_url:
        return BailianChatWrapper(
            model=model_name,
            temperature=temperature,
            api_key=api_key,
            base_url=base_url
        )
    
    # 否则使用标准的 LangChain OpenAI 客户端
    from langchain_openai import ChatOpenAI
    return ChatOpenAI(
        model=model_name,
        temperature=temperature,
        api_key=api_key,
        base_url=base_url
    )


# 全局 LLM 实例
_llm_instance = None


def get_default_llm():
    """获取默认的 LLM 实例（单例）"""
    global _llm_instance
    if _llm_instance is None:
        _llm_instance = get_llm()
    return _llm_instance
