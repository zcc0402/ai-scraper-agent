"""自我评估 Agent - 分析爬虫任务质量并提出改进建议

基于 Karpathy autoresearch 的自主改进循环理念：
1. 分析历史任务的爬取结果
2. 评估数据质量、完整性和准确性
3. 提出优化建议（Prompt 调整、工具配置修改）
4. 自动更新配置以提升未来任务成功率
"""

from textwrap import dedent
from crewai import Agent
from crewai.tools.base_tool import BaseTool
from typing import Optional
import json
from pathlib import Path

from src.agents.validator import DataValidationTool


class SelfAssessmentTool(BaseTool):
    """自我评估工具 - 分析任务历史并生成优化报告"""
    name: str = "self_assessment"
    description: str = "分析历史爬虫任务的成功率、数据质量，并提出优化建议"
    
    def _run(self, task_input: Optional[str] = None) -> str:
        """分析历史任务并生成优化报告"""
        try:
            # 读取历史任务记录
            history_file = Path("./data/scraper.db")
            if not history_file.exists():
                return "暂无历史任务数据"
            
            # 这里简化实现，实际应从数据库读取
            report = {
                "analysis_period": "最近 30 天",
                "total_tasks": 0,
                "success_rate": 0,
                "avg_duration": 0,
                "common_errors": [],
                "optimization_suggestions": []
            }
            
            return json.dumps(report, ensure_ascii=False, indent=2)
        except Exception as e:
            return f"评估失败: {str(e)}"


class SelfImprovementTool(BaseTool):
    """自我改进工具 - 自动应用优化建议"""
    name: str = "self_improvement"
    description: str = "根据评估结果自动优化爬虫配置、Prompt 和工具参数"
    
    def _run(self, optimization_plan: str) -> str:
        """应用优化计划"""
        try:
            # 这里实现自动修改配置文件、Prompt 模板等
            # 简化实现
            result = {
                "changes_made": [],
                "expected_improvement": "预计成功率提升 10-20%"
            }
            return json.dumps(result, ensure_ascii=False, indent=2)
        except Exception as e:
            return f"改进失败: {str(e)}"


class SelfImprovementAgent:
    """自我改进 Agent - 实现自主优化循环"""
    
    SYSTEM_PROMPT = dedent("""\
        你是爬虫系统的自我改进专家，受 Karpathy autoresearch 理念启发。
        
        你的职责：
        1. 定期分析历史爬虫任务的成功率、数据质量和常见问题
        2. 识别爬取策略中的薄弱环节
        3. 提出具体的优化建议：
           - Prompt 模板优化
           - 工具参数调整（超时、重试次数等）
           - 反爬策略改进
           - 数据提取逻辑优化
        4. 自动应用低风险优化，对高风险变更提出建议
        
        你的目标是建立一个自主改进循环：
        尝试 → 测量 → 学习 → 优化 → 重复
        
        关键指标：
        - 任务成功率
        - 数据准确率
        - 平均响应时间
        - 反爬对抗成功率
    """)
    
    def __init__(self, llm=None):
        self.llm = llm
    
    def create(self) -> Agent:
        return Agent(
            role='自我改进专家',
            goal=dedent("""\
                建立自主改进循环，持续提升爬虫系统的成功率和数据质量"""),
            backstory=self.SYSTEM_PROMPT,
            tools=[SelfAssessmentTool(), SelfImprovementTool()],
            verbose=True,
            llm=self.llm
        )
