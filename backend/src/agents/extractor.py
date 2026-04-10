"""Extractor Agent - 数据提取器

职责：从页面中智能识别并提取目标数据
"""

from textwrap import dedent
from langchain_openai import ChatOpenAI
from langchain_core.tools import BaseTool
from crewai import Agent

from src.tools.agent_browser import AgentBrowserTool


class ExtractorAgent:
    """
    数据提取器 Agent
    
    负责从页面中准确提取目标数据，输出结构化格式
    """
    
    SYSTEM_PROMPT = dedent("""\
        你是数据结构化专家，擅长分析页面内容并提取关键信息。
        
        你的职责：
        1. 分析页面结构，识别数据区域
        2. 提取目标数据字段
        3. 处理复杂的数据格式（如嵌套列表、表格等）
        4. 清洗和规范化提取的数据
        5. 输出结构化的数据（JSON 格式）
        
        你可以使用的工具：
        - snapshot: 获取页面快照，查看所有元素的 refs
        - extract: 通过 ref 提取元素内容
        - chat: 用自然语言指令提取数据
        
        提取原则：
        - 优先使用 chat 工具进行智能提取
        - 确保数据完整性和准确性
        - 处理缺失值和异常数据
        - 输出清晰的 JSON 结构
        
        输出格式要求：
        {{
            "data": [
                {{
                    "field1": "value1",
                    "field2": "value2",
                    ...
                }},
                ...
            ],
            "total_records": 数量,
            "extraction_notes": "提取过程中的特殊说明"
        }}
    """)
    
    def __init__(
        self,
        llm: ChatOpenAI | None = None,
        browser_tool: AgentBrowserTool | None = None
    ):
        """
        初始化 Extractor Agent
        
        Args:
            llm: LLM 实例
            browser_tool: agent-browser 工具实例
        """
        self.llm = llm or ChatOpenAI(
            model="gpt-4",
            temperature=0.3  # 低温度确保稳定的数据提取
        )
        self.browser_tool = browser_tool or AgentBrowserTool()
    
    def create(self) -> Agent:
        """
        创建 Extractor Agent 实例
        
        Returns:
            CrewAI Agent 实例
        """
        class ExtractorToolWrapper(BaseTool):
            name: str = "data_extraction"
            description: str = "从页面中提取数据，支持自然语言指令"
            
            def _run(self, instruction: str) -> str:
                """用自然语言指令提取数据"""
                result = self.browser_tool.chat(
                    f"从当前页面中提取数据：{instruction}"
                )
                if result["success"]:
                    return result["output"]
                else:
                    return f"数据提取失败: {result.get('error', '未知错误')}"
        
        tool = ExtractorToolWrapper(browser_tool=self.browser_tool)
        
        return Agent(
            role='数据提取器',
            goal=dedent("""\
                从页面中准确提取目标数据，输出结构化 JSON 格式"""),
            backstory=self.SYSTEM_PROMPT,
            tools=[tool],
            verbose=True,
            llm=self.llm
        )
