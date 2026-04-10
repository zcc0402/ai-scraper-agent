"""Navigator Agent - 浏览器导航员

职责：控制浏览器访问目标页面，处理跳转、等待、滚动等交互操作
"""

from textwrap import dedent
from langchain_openai import ChatOpenAI
from crewai import Agent
from crewai_tools import BaseTool

from src.tools.agent_browser import AgentBrowserTool


class NavigatorAgent:
    """
    浏览器导航员 Agent
    
    负责控制浏览器访问目标页面，完成所有必要的页面交互操作
    """
    
    SYSTEM_PROMPT = dedent("""\
        你是 Web 自动化专家，精通浏览器控制和页面导航。
        
        你的职责：
        1. 根据爬取计划访问目标页面
        2. 等待页面完全加载
        3. 处理动态内容（滚动、点击"加载更多"等）
        4. 处理登录、弹窗等交互（如有必要）
        5. 确保页面状态适合数据提取
        
        你可以使用的工具：
        - open_url: 导航到指定 URL
        - snapshot: 获取页面快照（包含元素 refs）
        - click: 点击元素（通过 ref）
        - type_text: 输入文本（通过 ref）
        - scroll: 滚动页面
        - chat: 用自然语言指令操作浏览器
        - screenshot: 截取页面截图
        - wait: 等待指定时间
        
        操作原则：
        - 优先使用 chat 工具进行自然语言操作
        - 如果需要精确控制，使用 snapshot 获取 refs，然后操作
        - 确保页面完全加载后再进行下一步
        - 遇到异常情况及时报告
    """)
    
    def __init__(
        self,
        llm: ChatOpenAI | None = None,
        browser_tool: AgentBrowserTool | None = None
    ):
        """
        初始化 Navigator Agent
        
        Args:
            llm: LLM 实例
            browser_tool: agent-browser 工具实例
        """
        self.llm = llm or ChatOpenAI(
            model="gpt-4",
            temperature=0.3  # 更低的温度以获得更稳定的浏览器操作
        )
        self.browser_tool = browser_tool or AgentBrowserTool()
    
    def create(self) -> Agent:
        """
        创建 Navigator Agent 实例
        
        Returns:
            CrewAI Agent 实例
        """
        # 创建工具包装器
        class BrowserToolWrapper(BaseTool):
            name: str = "browser_navigation"
            description: str = "控制浏览器执行导航、点击、输入等操作"
            
            def _run(self, instruction: str) -> str:
                """用自然语言指令控制浏览器"""
                result = self.browser_tool.chat(instruction)
                if result["success"]:
                    return result["output"]
                else:
                    return f"浏览器操作失败: {result.get('error', '未知错误')}"
        
        tool = BrowserToolWrapper(browser_tool=self.browser_tool)
        
        return Agent(
            role='浏览器导航员',
            goal=dedent("""\
                根据爬取计划，控制浏览器访问目标页面并完成所有必要的交互操作"""),
            backstory=self.SYSTEM_PROMPT,
            tools=[tool],
            verbose=True,
            allow_delegation=True,
            llm=self.llm
        )
