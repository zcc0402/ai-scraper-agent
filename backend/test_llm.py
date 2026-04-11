"""测试百炼 API 连接 (qwen3.6-plus)"""

from src.llm.provider import get_llm

def test_llm():
    """测试 LLM 调用"""
    print("正在测试百炼 API (qwen3.6-plus)...")
    
    llm = get_llm(temperature=0.7)
    
    # 兼容处理
    model = getattr(llm, 'model', 'unknown')
    print(f"模型: {model}")
    print("-" * 40)
    
    try:
        response = llm.invoke("你好，请用一句话介绍你自己")
        print("✅ 测试成功!")
        print(f"回复: {response.content}")
        return True
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_llm()
