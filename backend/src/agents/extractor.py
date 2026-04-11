"""Extractor Agent - 数据提取器"""

from textwrap import dedent
from langchain_openai import ChatOpenAI
from crewai import Agent
from crewai.tools.base_tool import BaseTool

from src.tools.agent_browser import AgentBrowserTool


class DataExtractionTool(BaseTool):
    name: str = "data_extraction"
    description: str = "从页面中提取数据，支持自然语言指令"
    browser_tool: AgentBrowserTool = None
    
    def _run(self, instruction: str) -> str:
        result = self.browser_tool.chat(f"从当前页面中提取数据：{instruction}")
        if result.get("success"):
            return result.get("output", "提取成功")
        else:
            return f"数据提取失败: {result.get('error', '未知错误')}"


class ExtractorAgent:
    """数据提取器 Agent"""
    
    SYSTEM_PROMPT = dedent("""\
        你是数据结构化专家，擅长分析页面内容并提取关键信息。
        
        你的职责：
        1. 分析页面结构，识别数据区域
        2. 提取目标数据字段
        3. 处理复杂的数据格式
        4. 输出结构化的 JSON 数据
    """)
    
    def __init__(
        self,
        llm: ChatOpenAI | None = None,
        browser_tool: AgentBrowserTool | None = None
    ):
        self.llm = llm or ChatOpenAI(model="gpt-4", temperature=0.3)
        self.browser_tool = browser_tool or AgentBrowserTool()
    
    def create(self) -> Agent:
        tool = DataExtractionTool(browser_tool=self.browser_tool)
        
        return Agent(
            role='数据提取器',
            goal=dedent("""\
                从页面中准确提取目标数据，输出结构化 JSON 格式"""),
            backstory=self.SYSTEM_PROMPT,
            tools=[tool],
            verbose=True,
            llm=self.llm
        )
