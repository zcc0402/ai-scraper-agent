"""定时任务调度服务 - APScheduler"""

import logging
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger

from src.models.database import SessionLocal, Task
from src.services.task_service import run_scraper_task_async
import asyncio

logger = logging.getLogger(__name__)

# 全局调度器实例
scheduler = BackgroundScheduler()


class SchedulerService:
    """定时任务调度服务"""
    
    def __init__(self):
        self.running_jobs = {}
    
    def add_cron_task(
        self,
        task_id: str,
        user_input: str,
        output_format: str,
        cron_expression: str
    ):
        """
        添加定时循环任务
        
        Args:
            task_id: 任务 ID
            user_input: 用户指令
            output_format: 输出格式
            cron_expression: Cron 表达式 (如: "0 9 * * *" 每天早9点)
        """
        try:
            # 解析 cron 表达式
            parts = cron_expression.split()
            if len(parts) != 5:
                raise ValueError("Cron 表达式格式错误，应为: 分 时 日 月 星期")
            
            minute, hour, day, month, day_of_week = parts
            
            # 添加定时任务
            job = scheduler.add_job(
                self._execute_scheduled_task,
                CronTrigger(
                    minute=minute,
                    hour=hour,
                    day=day,
                    month=month,
                    day_of_week=day_of_week
                ),
                args=[task_id, user_input, output_format],
                id=f"scheduled_{task_id}",
                replace_existing=True,
                max_instances=1
            )
            
            self.running_jobs[task_id] = job
            logger.info(f"✅ 添加定时任务: {task_id}, cron: {cron_expression}")
            
        except Exception as e:
            logger.error(f"❌ 添加定时任务失败: {e}")
            raise
    
    def add_interval_task(
        self,
        task_id: str,
        user_input: str,
        output_format: str,
        hours: int = 0,
        minutes: int = 0,
        seconds: int = 0
    ):
        """
        添加间隔循环任务
        
        Args:
            task_id: 任务 ID
            user_input: 用户指令
            output_format: 输出格式
            hours: 间隔小时数
            minutes: 间隔分钟数
            seconds: 间隔秒数
        """
        try:
            job = scheduler.add_job(
                self._execute_scheduled_task,
                IntervalTrigger(
                    hours=hours,
                    minutes=minutes,
                    seconds=seconds
                ),
                args=[task_id, user_input, output_format],
                id=f"interval_{task_id}",
                replace_existing=True,
                max_instances=1
            )
            
            self.running_jobs[task_id] = job
            logger.info(f"✅ 添加间隔任务: {task_id}, 每 {hours}h {minutes}m {seconds}s")
            
        except Exception as e:
            logger.error(f"❌ 添加间隔任务失败: {e}")
            raise
    
    def remove_task(self, task_id: str):
        """移除定时任务"""
        job_id = f"scheduled_{task_id}"
        if scheduler.get_job(job_id):
            scheduler.remove_job(job_id)
            logger.info(f"🗑️  移除定时任务: {task_id}")
        
        job_id = f"interval_{task_id}"
        if scheduler.get_job(job_id):
            scheduler.remove_job(job_id)
            logger.info(f"🗑️  移除间隔任务: {task_id}")
        
        self.running_jobs.pop(task_id, None)
    
    def get_active_jobs(self) -> list:
        """获取所有活跃的定时任务"""
        return scheduler.get_jobs()
    
    async def _execute_scheduled_task(self, task_id: str, user_input: str, output_format: str):
        """执行定时任务"""
        logger.info(f"⏰ 执行定时任务: {task_id}")
        await run_scraper_task_async(task_id, user_input, output_format)


def init_scheduler():
    """初始化调度器"""
    if not scheduler.running:
        scheduler.start()
        logger.info("🕒 定时任务调度器已启动")


def shutdown_scheduler():
    """关闭调度器"""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("👋 定时任务调度器已关闭")


# 全局调度器服务实例
scheduler_service = SchedulerService()
