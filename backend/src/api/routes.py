"""API 路由定义"""

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query
from typing import List

from src.api.schemas import ScrapingRequest, TaskResponse, TaskStatusResponse, TaskListResponse
from src.services.task_service import TaskService, run_scraper_task_async

router = APIRouter(prefix="/api/v1", tags=["爬虫任务"])


@router.post("/scrape", response_model=TaskResponse, summary="创建爬虫任务")
async def create_scraping_task(
    request: ScrapingRequest,
    background_tasks: BackgroundTasks
):
    """
    创建一个新的爬虫任务
    
    - **user_input**: 自然语言爬虫指令
    - **output_format**: 输出格式 (json/csv/excel)
    - **timeout**: 超时时间（秒）
    """
    service = TaskService()
    
    # 创建任务记录
    task_id = service.create_task(
        user_input=request.user_input,
        output_format=request.output_format
    )
    
    # 添加后台任务执行
    background_tasks.add_task(
        run_scraper_task_async,
        task_id=task_id,
        user_input=request.user_input,
        output_format=request.output_format
    )
    
    return TaskResponse(
        task_id=task_id,
        status="pending",
        message="任务已创建，正在后台执行"
    )


@router.get("/tasks/{task_id}", response_model=TaskStatusResponse, summary="查询任务状态")
async def get_task_status(task_id: str):
    """
    查询指定任务的执行状态
    """
    service = TaskService()
    task = service.get_task(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail=f"任务 {task_id} 不存在")
    
    return TaskStatusResponse(
        task_id=task.task_id,
        user_input=task.user_input,
        status=task.status,
        progress=task.progress,
        result=task.result_data,
        error=task.error_message,
        created_at=task.created_at,
        completed_at=task.completed_at
    )


@router.get("/tasks", response_model=TaskListResponse, summary="查询任务列表")
async def list_tasks(
    limit: int = Query(default=20, ge=1, le=100, description="返回数量限制"),
    offset: int = Query(default=0, ge=0, description="偏移量")
):
    """
    查询任务列表（按创建时间倒序）
    """
    service = TaskService()
    tasks = service.get_all_tasks(limit=limit, offset=offset)
    
    task_list = [
        TaskStatusResponse(
            task_id=t.task_id,
            user_input=t.user_input,
            status=t.status,
            progress=t.progress,
            result=t.result_data,
            error=t.error_message,
            created_at=t.created_at,
            completed_at=t.completed_at
        )
        for t in tasks
    ]
    
    return TaskListResponse(total=len(task_list), tasks=task_list)


@router.post("/tasks/{task_id}/cancel", summary="取消任务")
async def cancel_task(task_id: str):
    """
    取消正在执行或等待中的任务
    """
    service = TaskService()
    success = service.cancel_task(task_id)
    
    if not success:
        task = service.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="任务不存在")
        raise HTTPException(
            status_code=400,
            detail=f"任务状态为 {task.status}，无法取消"
        )
    
    return {"message": "任务已取消"}
