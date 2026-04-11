"""Validator Agent - 数据验证员"""

from textwrap import dedent
from langchain_openai import ChatOpenAI
from crewai import Agent
from crewai.tools.base_tool import BaseTool
import pandas as pd


class DataValidationTool(BaseTool):
    name: str = "data_validation"
    description: str = "验证数据质量、清洗数据、导出文件"
    
    def _run(self, task: str) -> str:
        return f"验证任务: {task}"


class ValidatorAgent:
    """数据验证员 Agent"""
    
    SYSTEM_PROMPT = dedent("""\
        你是数据质量保证专家，精通数据验证、清洗和格式化。
        
        你的职责：
        1. 验证提取数据的质量和完整性
        2. 检查数据是否符合预期格式
        3. 清洗和规范化数据
        4. 导出数据到指定格式
        5. 生成数据质量报告
    """)
    
    def __init__(self, llm: ChatOpenAI | None = None):
        self.llm = llm or ChatOpenAI(model="gpt-4", temperature=0.2)
    
    def create(self) -> Agent:
        tool = DataValidationTool()
        
        return Agent(
            role='数据验证员',
            goal=dedent("""\
                验证提取数据的质量和完整性，确保符合预期格式并导出文件"""),
            backstory=self.SYSTEM_PROMPT,
            tools=[tool],
            verbose=True,
            llm=self.llm
        )
