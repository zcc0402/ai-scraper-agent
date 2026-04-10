"""Validator Agent - 数据验证员

职责：验证数据质量和完整性，确保符合预期格式
"""

from textwrap import dedent
from langchain_openai import ChatOpenAI
from crewai import Agent
from crewai_tools import BaseTool
import pandas as pd
from typing import Any


class DataValidationTool:
    """数据验证工具 - 使用 Pandas 进行确定性验证"""
    
    def validate_schema(self, data: list[dict], required_fields: list[str]) -> dict:
        """
        验证数据 schema
        
        Args:
            data: 数据列表
            required_fields: 必填字段列表
            
        Returns:
            验证结果
        """
        if not data:
            return {
                "valid": False,
                "issues": ["数据为空"],
                "statistics": {}
            }
        
        df = pd.DataFrame(data)
        
        issues = []
        
        # 检查必填字段
        missing_fields = [f for f in required_fields if f not in df.columns]
        if missing_fields:
            issues.append(f"缺少字段: {', '.join(missing_fields)}")
        
        # 检查空值
        null_counts = df.isnull().sum()
        for field, count in null_counts.items():
            if count > 0:
                issues.append(f"字段 '{field}' 有 {count} 个空值")
        
        # 检查重复数据
        duplicate_count = df.duplicated().sum()
        if duplicate_count > 0:
            issues.append(f"发现 {duplicate_count} 条重复数据")
        
        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "statistics": {
                "total_records": len(df),
                "columns": list(df.columns),
                "null_counts": null_counts.to_dict(),
                "duplicate_count": int(duplicate_count)
            }
        }
    
    def clean_data(self, data: list[dict]) -> pd.DataFrame:
        """
        数据清洗
        
        Args:
            data: 原始数据列表
            
        Returns:
            清洗后的 DataFrame
        """
        df = pd.DataFrame(data)
        
        # 删除全空行
        df = df.dropna(how='all')
        
        # 去重
        df = df.drop_duplicates()
        
        # 重置索引
        df = df.reset_index(drop=True)
        
        return df
    
    def export_data(
        self,
        df: pd.DataFrame,
        format: str,
        output_path: str
    ) -> str:
        """
        导出数据到文件
        
        Args:
            df: DataFrame
            format: 输出格式 (json, csv, excel)
            output_path: 输出文件路径
            
        Returns:
            实际输出文件路径
        """
        from pathlib import Path
        
        # 确保目录存在
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        
        if format == "json":
            df.to_json(output_path, orient='records', force_ascii=False, indent=2)
        elif format == "csv":
            df.to_csv(output_path, index=False, encoding='utf-8-sig')
        elif format == "excel":
            df.to_excel(output_path, index=False)
        else:
            raise ValueError(f"不支持的格式: {format}")
        
        return output_path


class ValidatorAgent:
    """
    数据验证员 Agent
    
    负责验证数据质量和完整性，确保符合预期格式
    """
    
    SYSTEM_PROMPT = dedent("""\
        你是数据质量保证专家，精通数据验证、清洗和格式化。
        
        你的职责：
        1. 验证提取数据的质量和完整性
        2. 检查数据是否符合预期格式
        3. 清洗和规范化数据
        4. 导出数据到指定格式（JSON/CSV/Excel）
        5. 生成数据质量报告
        
        验证标准：
        - 数据字段完整性
        - 数据格式正确性
        - 无重复记录
        - 无异常值
        
        如果数据质量不达标：
        - 详细说明问题
        - 提供修复建议
        - 如无法修复，标记为部分成功
    """)
    
    def __init__(
        self,
        llm: ChatOpenAI | None = None,
        validation_tool: DataValidationTool | None = None
    ):
        """
        初始化 Validator Agent
        
        Args:
            llm: LLM 实例
            validation_tool: 数据验证工具实例
        """
        self.llm = llm or ChatOpenAI(
            model="gpt-4",
            temperature=0.2  # 极低温度确保严谨的验证
        )
        self.validation_tool = validation_tool or DataValidationTool()
    
    def create(self) -> Agent:
        """
        创建 Validator Agent 实例
        
        Returns:
            CrewAI Agent 实例
        """
        class ValidationToolWrapper(BaseTool):
            name: str = "data_validation"
            description: str = "验证数据质量、清洗数据、导出文件"
            
            def _run(self, task: str) -> str:
                """执行数据验证任务"""
                # 这里会解析任务并调用相应的验证方法
                # 简化实现，实际应由 LLM 解析任务
                return f"验证任务: {task}"
        
        tool = ValidationToolWrapper(validation_tool=self.validation_tool)
        
        return Agent(
            role='数据验证员',
            goal=dedent("""\
                验证提取数据的质量和完整性，确保符合预期格式并导出文件"""),
            backstory=self.SYSTEM_PROMPT,
            tools=[tool],
            verbose=True,
            llm=self.llm
        )
