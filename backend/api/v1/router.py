from fastapi import APIRouter
from api.v1.endpoints import holdings, transactions, portfolio, exchange, alerts

# API v1 메인 라우터
api_router = APIRouter()

# 각 엔드포인트 라우터 등록
api_router.include_router(
    holdings.router,
    prefix="/holdings",
    tags=["보유종목"]
)

api_router.include_router(
    transactions.router,
    prefix="/transactions",
    tags=["거래"]
)

api_router.include_router(
    portfolio.router,
    prefix="/portfolio",
    tags=["포트폴리오"]
)

api_router.include_router(
    exchange.router,
    prefix="/exchange-rate",
    tags=["환율"]
)

api_router.include_router(
    alerts.router,
    prefix="/alerts",
    tags=["알림"]
)
