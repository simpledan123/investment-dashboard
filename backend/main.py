from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import logging

from database import init_db
from api.v1.router import api_router
from services.scheduler import PriceAlertScheduler
from schemas.common import MessageResponse, HealthCheckResponse
from core.config import settings

# 로깅 설정
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI 앱 초기화
app = FastAPI(
    title=settings.APP_NAME,
    description="미국 주식/ETF 포트폴리오 관리 시스템",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 스케줄러 인스턴스
scheduler = PriceAlertScheduler()


# ==================== 이벤트 핸들러 ====================

@app.on_event("startup")
async def startup_event():
    """애플리케이션 시작 시 실행"""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    
    # 데이터베이스 초기화
    init_db()
    logger.info("Database initialized")
    
    # 스케줄러 시작
    scheduler.start()
    logger.info("Price alert scheduler started")


@app.on_event("shutdown")
async def shutdown_event():
    """애플리케이션 종료 시 실행"""
    logger.info("Shutting down application...")
    scheduler.stop()
    logger.info("Application shutdown complete")


# ==================== 루트 엔드포인트 ====================

@app.get("/", response_model=MessageResponse)
async def root():
    """API 루트"""
    return MessageResponse(
        message=f"{settings.APP_NAME} is running",
        detail="Visit /docs for API documentation"
    )


@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """헬스 체크"""
    return HealthCheckResponse(
        status="healthy",
        timestamp=datetime.now()
    )


# ==================== API v1 라우터 등록 ====================

app.include_router(api_router, prefix="/api/v1")


# ==================== 개발 서버 실행 ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
