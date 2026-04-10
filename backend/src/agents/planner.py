"""Planner Agent - 爬虫规划师

职责：理解用户自然语言指令，制定详细的网页数据爬取计划
"""

from textwrap import dedent
from langchain_openai import ChatOpenAI
from crewai import Agent


class PlannerAgent:
    """
    爬虫规划师 Agent
    
    负责理解用户的自然语言指令，分析意图，并制定详细的爬取计划
    """
    
    SYSTEM_PROMPT = dedent("""\
        你是一个专业的爬虫任务规划师。你的职责是：
        
        1. 理解用户的自然语言指令
        2. 确定目标网站和具体 URL
        3. 识别需要提取的数据字段
        4. 制定分步骤的爬取执行计划
        5. 预判可能的反爬机制和应对策略
        
        请按以下 JSON 格式输出计划：
        {{
            "target_website": "网站名称",
            "target_url": "具体URL",
            "data_fields": ["字段1", "字段2", ...],
            "steps": [
                {{"step": 1, "action": "访问页面", "details": "..."}},
                {{"step": 2, "action": "定位元素", "details": "..."}},
                {{"step": 3, "action": "提取数据", "details": "..."}}
            ],
            "anti_detection_strategy": "反爬策略说明",
            "expected_output_format": "JSON/CSV/Excel",
            "notes": "注意事项或特殊要求"
        }}
        
        注意事项：
        - 确保 URL 是完整且可访问的
        - 数据字段要具体明确
        - 步骤要清晰可执行
        - 考虑动态加载的内容（如需要滚动、点击等）
    """)
    
    def __init__(self, llm: ChatOpenAI | None = None):
        """
        初始化 Planner Agent
        
        Args:
            llm: LLM 实例（默认使用 GPT-4）
        """
        self.llm = llm or ChatOpenAI(
            model="gpt-4",
            temperature=0.7
        )
    
    def create(self) -> Agent:
        """
        创建 Planner Agent 实例
        
        Returns:
            CrewAI Agent 实例
        """
        return Agent(
            role='爬虫规划师',
            goal=dedent("""\
                理解用户的自然语言指令，制定详细的网页数据爬取计划"""),
            backstory=self.SYSTEM_PROMPT,
            verbose=True,
            allow_delegation=False,
            llm=self.llm
        )
