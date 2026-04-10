"""数据库模型定义 - SQLAlchemy"""

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from src.utils.config import settings

# 创建数据库引擎
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite 需要这个参数
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Task(Base):
    """爬虫任务数据模型"""
    
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    task_id = Column(String(36), unique=True, index=True, nullable=False, comment="任务唯一 ID (UUID)")
    user_input = Column(Text, nullable=False, comment="用户输入的自然语言指令")
    output_format = Column(String(10), default="json", comment="输出格式 (json/csv/excel)")
    status = Column(String(20), default="pending", comment="任务状态")
    progress = Column(Text, nullable=True, comment="当前进度描述")
    result_data = Column(JSON, nullable=True, comment="任务结果数据")
    error_message = Column(Text, nullable=True, comment="错误信息")
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    completed_at = Column(DateTime, nullable=True, comment="完成时间")


def get_db():
    """获取数据库会话依赖（用于 FastAPI）"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """初始化数据库表"""
    Base.metadata.create_all(bind=engine)
    print(f"✅ 数据库初始化完成: {settings.DATABASE_URL}")


# 启动时初始化
init_db()
