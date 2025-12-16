from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import settings

# SQLAlchemy engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # SQL 쿼리 로깅
    pool_pre_ping=True,   # 연결 상태 체크
    pool_size=5,
    max_overflow=10
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def init_db():
    """데이터베이스 테이블 생성"""
    # Import all models here to ensure they are registered
    from models import Holdings, Transactions, Alerts
    
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")


def get_db():
    """FastAPI dependency - DB 세션 제공"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
