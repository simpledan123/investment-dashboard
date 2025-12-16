from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from api.deps import get_db_session
from crud import holdings as crud_holdings
from schemas import HoldingResponse, StockDetailResponse

router = APIRouter()


@router.get("/", response_model=List[HoldingResponse])
async def read_holdings(db: Session = Depends(get_db_session)):
    """보유 종목 목록 조회 (현재가 포함)"""
    return crud_holdings.get_all_holdings_with_stats(db)


@router.get("/{ticker}", response_model=StockDetailResponse)
async def read_holding_detail(ticker: str, db: Session = Depends(get_db_session)):
    """특정 종목 상세 정보 조회"""
    holding_detail = crud_holdings.get_holding_detail(db, ticker)
    
    if not holding_detail:
        raise HTTPException(
            status_code=404,
            detail=f"종목 {ticker}를 찾을 수 없습니다"
        )
    
    return holding_detail


@router.delete("/{ticker}")
async def delete_holding(ticker: str, db: Session = Depends(get_db_session)):
    """종목 삭제"""
    success = crud_holdings.delete_holding(db, ticker)
    
    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"종목 {ticker}를 찾을 수 없습니다"
        )
    
    return {"message": f"{ticker} 종목이 삭제되었습니다"}
