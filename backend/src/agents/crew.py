"""Crew 编排 - 爬虫任务完整流程"""

from textwrap import dedent
from datetime import datetime
from pathlib import Path

from crewai import Crew, Process, Task
from src.llm.provider import get_llm

from src.agents.planner import PlannerAgent
from src.agents.navigator import NavigatorAgent
from src.agents.extractor import ExtractorAgent
from src.agents.validator import ValidatorAgent
from src.tools.agent_browser import AgentBrowserTool
from src.utils.config import settings


class ScraperCrew:
    """
    爬虫任务 Crew 编排
    
    负责协调 4 个 Agent 完成完整的爬虫任务：
    1. Planner Agent - 理解意图，制定计划
    2. Navigator Agent - 访问页面，处理交互
    3. Extractor Agent - 提取数据
    4. Validator Agent - 验证质量，导出文件
    """
    
    def __init__(
        self,
        user_input: str,
        output_format: str = "json",
        output_dir: str | None = None
    ):
        """初始化 Crew"""
        self.user_input = user_input
        self.output_format = output_format
        self.output_dir = output_dir or settings.DATA_OUTPUT_DIR
        
        Path(self.output_dir).mkdir(parents=True, exist_ok=True)
        
        # 使用统一 LLM 适配器
        self.llm = get_llm(temperature=0.7)
        
        # 初始化工具
        self.browser_tool = AgentBrowserTool()
        
        # 初始化 Agents
        self.planner = PlannerAgent(self.llm).create()
        self.navigator = NavigatorAgent(self.llm, self.browser_tool).create()
        self.extractor = ExtractorAgent(self.llm, self.browser_tool).create()
        self.validator = ValidatorAgent(self.llm).create()
    
    def _create_tasks(self) -> list[Task]:
        """
        创建任务链
        
        Returns:
            任务列表
        """
        # 任务 1: 规划
        plan_task = Task(
            description=dedent(f"""\
                分析用户指令并制定详细的爬取计划
                
                用户指令：{self.user_input}
                
                请输出详细的爬取计划，包括：
                - 目标网站和 URL
                - 需要提取的数据字段
                - 分步骤的执行计划
                - 反爬策略
                
                必须以 JSON 格式输出计划。
            """),
            agent=self.planner,
            expected_output="详细的爬取计划 JSON，包含 target_url, data_fields, steps 等字段"
        )
        
        # 任务 2: 导航
        navigate_task = Task(
            description=dedent("""\
                根据爬取计划访问目标页面并完成所有必要的页面交互
                
                请仔细阅读上一步制定的计划，然后：
                1. 打开目标 URL
                2. 等待页面完全加载
                3. 处理必要的交互（如点击、滚动、关闭弹窗等）
                4. 确保页面状态适合数据提取
                
                完成后请确认页面已就绪。
            """),
            agent=self.navigator,
            expected_output="页面访问成功确认，说明当前页面状态",
            context=[plan_task]
        )
        
        # 任务 3: 提取
        extract_task = Task(
            description=dedent("""\
                从当前页面中提取目标数据
                
                请根据爬取计划中定义的数据字段：
                1. 分析页面结构
                2. 识别数据区域
                3. 提取所有目标数据
                4. 输出结构化的 JSON 数据
                
                确保数据完整性和准确性。
            """),
            agent=self.extractor,
            expected_output="提取的原始数据列表，JSON 格式",
            context=[navigate_task]
        )
        
        # 任务 4: 验证和导出
        validate_task = Task(
            description=dedent(f"""\
                验证数据质量并导出为 {self.output_format} 格式
                
                请：
                1. 验证数据完整性（检查必填字段、空值、重复等）
                2. 清洗数据（去重、删除空行）
                3. 导出为 {self.output_format} 文件到 {self.output_dir}
                4. 生成数据质量报告
                
                输出文件命名格式：scraper_{{时间戳}}.{self.output_format}
            """),
            agent=self.validator,
            expected_output=f"验证报告和导出的文件路径，{self.output_format} 格式",
            context=[extract_task]
        )
        
        return [plan_task, navigate_task, extract_task, validate_task]
    
    def execute(self) -> dict:
        """
        执行爬虫任务
        
        Returns:
            执行结果，包含任务计划和提取的数据
        """
        tasks = self._create_tasks()
        
        # 创建 Crew
        crew = Crew(
            agents=[self.planner, self.navigator, self.extractor, self.validator],
            tasks=tasks,
            process=Process.sequential,  # 顺序执行
            verbose=True,
            memory=True  # 启用记忆，让 Agent 共享上下文
        )
        
        # 执行
        print(f"\n{'='*60}")
        print(f"🚀 开始执行爬虫任务")
        print(f"📝 指令: {self.user_input}")
        print(f"📦 输出格式: {self.output_format}")
        print(f"{'='*60}\n")
        
        start_time = datetime.now()
        result = crew.kickoff()
        end_time = datetime.now()
        
        duration = (end_time - start_time).total_seconds()
        
        print(f"\n{'='*60}")
        print(f"✅ 任务完成!")
        print(f"⏱️  耗时: {duration:.2f} 秒")
        print(f"{'='*60}\n")
        
        return {
            "success": True,
            "user_input": self.user_input,
            "output_format": self.output_format,
            "duration_seconds": duration,
            "result": result.raw,
            "completed_at": end_time.isoformat()
        }
