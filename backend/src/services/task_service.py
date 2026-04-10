"""Task Service - 任务管理业务逻辑"""

import asyncio
import uuid
import logging
import concurrent.futures
from datetime import datetime
from typing import Optional, List

from src.models.database import SessionLocal, Task
from src.agents.crew import ScraperCrew

logger = logging.getLogger(__name__)


class TaskService:
    """任务管理服务"""
    
    def create_task(self, user_input: str, output_format: str = "json") -> str:
        """创建新任务"""
        db = SessionLocal()
        try:
            task_id = str(uuid.uuid4())
            new_task = Task(
                task_id=task_id,
                user_input=user_input,
                output_format=output_format,
                status="pending",
                progress="任务已创建，等待执行"
            )
            db.add(new_task)
            db.commit()
            db.refresh(new_task)
            logger.info(f"创建任务: {task_id}")
            return task_id
        finally:
            db.close()
    
    def get_task(self, task_id: str) -> Optional[Task]:
        """获取单个任务"""
        db = SessionLocal()
        try:
            return db.query(Task).filter(Task.task_id == task_id).first()
        finally:
            db.close()
    
    def get_all_tasks(self, limit: int = 20, offset: int = 0) -> List[Task]:
        """获取任务列表"""
        db = SessionLocal()
        try:
            return db.query(Task)\
                .order_by(Task.created_at.desc())\
                .offset(offset)\
                .limit(limit)\
                .all()
        finally:
            db.close()
    
    def update_task_status(self, task_id: str, status: str, progress: str = None):
        """更新任务状态"""
        db = SessionLocal()
        try:
            task = db.query(Task).filter(Task.task_id == task_id).first()
            if task:
                task.status = status
                if progress:
                    task.progress = progress
                if status in ["completed", "failed", "cancelled"]:
                    task.completed_at = datetime.utcnow()
                db.commit()
                logger.info(f"任务 {task_id} 状态更新为: {status}")
        finally:
            db.close()
    
    def update_task_result(self, task_id: str, result: dict):
        """更新任务结果"""
        db = SessionLocal()
        try:
            task = db.query(Task).filter(Task.task_id == task_id).first()
            if task:
                task.status = "completed"
                task.result_data = result
                task.progress = "任务完成"
                task.completed_at = datetime.utcnow()
                db.commit()
                logger.info(f"任务 {task_id} 已完成")
        finally:
            db.close()
    
    def update_task_error(self, task_id: str, error: str):
        """更新任务错误"""
        db = SessionLocal()
        try:
            task = db.query(Task).filter(Task.task_id == task_id).first()
            if task:
                task.status = "failed"
                task.error_message = error
                task.progress = "任务执行失败"
                task.completed_at = datetime.utcnow()
                db.commit()
                logger.error(f"任务 {task_id} 失败: {error}")
        finally:
            db.close()
    
    def cancel_task(self, task_id: str) -> bool:
        """取消任务"""
        db = SessionLocal()
        try:
            task = db.query(Task).filter(Task.task_id == task_id).first()
            if task and task.status in ["pending", "running"]:
                task.status = "cancelled"
                task.progress = "任务已取消"
                task.completed_at = datetime.utcnow()
                db.commit()
                return True
            return False
        finally:
            db.close()


async def run_scraper_task_async(task_id: str, user_input: str, output_format: str):
    """
    异步执行爬虫任务
    
    使用线程池执行 CrewAI 同步代码，避免阻塞 FastAPI 事件循环
    """
    service = TaskService()
    
    try:
        service.update_task_status(task_id, "running", "正在初始化 Agent...")
        
        # 在线程池中执行 CrewAI（因为它是同步的）
        def execute_crew():
            crew = ScraperCrew(
                user_input=user_input,
                output_format=output_format
            )
            return crew.execute()
        
        service.update_task_status(task_id, "planning", "正在制定计划...")
        
        loop = asyncio.get_event_loop()
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(execute_crew)
            # 设置超时
            result = await asyncio.wait_for(
                loop.run_in_executor(executor, lambda: future.result()),
                timeout=600  # 10 分钟超时
            )
        
        service.update_task_result(task_id, result)
        logger.info(f"✅ 任务 {task_id} 执行成功")
        
    except asyncio.TimeoutError:
        error_msg = "任务执行超时 (10分钟)"
        logger.error(f"⏰ 任务 {task_id} 超时")
        service.update_task_error(task_id, error_msg)
        
    except Exception as e:
        error_msg = f"任务执行异常: {str(e)}"
        logger.error(f"❌ 任务 {task_id} 异常: {e}", exc_info=True)
        service.update_task_error(task_id, error_msg)
