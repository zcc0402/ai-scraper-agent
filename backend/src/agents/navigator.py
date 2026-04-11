"""Navigator Agent - 浏览器导航员

职责：控制浏览器访问目标页面，处理跳转、等待、滚动等交互操作
"""

from textwrap import dedent
from langchain_openai import ChatOpenAI
from crewai import Agent
from crewai.tools.base_tool import BaseTool

from src.tools.agent_browser import AgentBrowserTool


class BrowserNavigationTool(BaseTool):
    name: str = "browser_navigation"
    description: str = "用自然语言指令控制浏览器执行操作，如导航、点击、输入、滚动等"
    browser_tool: AgentBrowserTool = None
    
    def _run(self, instruction: str) -> str:
        """
        智能导航：解析指令并执行相应操作
        支持：打开 URL、滚动、等待、截图
        """
        try:
            # 判断是否包含 URL
            if "http" in instruction or "open" in instruction.lower() or "打开" in instruction or "访问" in instruction:
                import re
                urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', instruction)
                if urls:
                    url = urls[0]
                    if not url.startswith('http'):
                        url = 'https://' + url
                    self.browser_tool.open_url(url)
                    return f"✅ 已打开页面：{url}"
                else:
                    return "⚠️ 未找到有效的 URL"
            
            # 滚动操作
            if "scroll" in instruction.lower() or "滚动" in instruction:
                self.browser_tool.scroll("down")
                return "✅ 页面已向下滚动"
            
            # 等待操作
            if "wait" in instruction.lower() or "等待" in instruction:
                self.browser_tool.wait(2000)
                return "✅ 已等待 2 秒"
            
            # 截图
            if "screenshot" in instruction.lower() or "截图" in instruction:
                result = self.browser_tool.screenshot("/tmp/screenshot.png")
                return f"✅ 截图已保存：{result.get('path', '/tmp/screenshot.png')}"
            
            return "✅ 指令执行完成"
        except Exception as e:
            return f"❌ 浏览器操作失败: {str(e)}"


class NavigatorAgent:
    """浏览器导航员 Agent"""
    
    SYSTEM_PROMPT = dedent("""\
        你是 Web 自动化专家，精通浏览器控制和页面导航。
        
        你的职责：
        1. 根据爬取计划访问目标页面
        2. 等待页面完全加载
        3. 处理动态内容（滚动、点击"加载更多"等）
        4. 处理弹窗等交互
        5. 确保页面状态适合数据提取
        
        操作原则：
        - 使用 browser_navigation 工具通过自然语言控制浏览器
        - 确保页面完全加载后再进行下一步
        - 遇到异常情况及时报告
    """)
    
    def __init__(
        self,
        llm: ChatOpenAI | None = None,
        browser_tool: AgentBrowserTool | None = None
    ):
        self.llm = llm or ChatOpenAI(model="gpt-4", temperature=0.3)
        self.browser_tool = browser_tool or AgentBrowserTool()
    
    def create(self) -> Agent:
        tool = BrowserNavigationTool(browser_tool=self.browser_tool)
        
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
