"""Pydantic Schemas - API 请求和响应模型"""

from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime


class ScrapingRequest(BaseModel):
    """创建爬虫任务请求"""
    
    user_input: str = Field(
        ..., 
        min_length=5, 
        max_length=2000,
        description="自然语言爬虫指令",
        example="帮我抓取 Hacker News 前10条标题和链接"
    )
    output_format: str = Field(
        default="json", 
        description="输出格式",
        pattern="^(json|csv|excel)$"
    )
    timeout: int = Field(
        default=300, 
        ge=60, 
        le=3600,
        description="超时时间（秒）"
    )


class TaskResponse(BaseModel):
    """任务创建响应"""
    
    task_id: str
    status: str
    message: str


class TaskStatusResponse(BaseModel):
    """任务状态响应"""
    
    task_id: str
    user_input: str
    status: str
    progress: Optional[str] = None
    result: Optional[Any] = None
    error: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None


class TaskListResponse(BaseModel):
    """任务列表响应"""
    
    total: int
    tasks: list[TaskStatusResponse]
