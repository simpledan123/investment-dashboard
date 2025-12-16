from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.deps import get_db_session
from crud import portfolio as crud_portfolio
from schemas import PortfolioSummaryResponse

router = APIRouter()


@router.get("/summary", response_model=PortfolioSummaryResponse)
async def get_portfolio_summary(db: Session = Depends(get_db_session)):
    """포트폴리오 전체 요약 정보"""
    return crud_portfolio.get_portfolio_summary(db)
