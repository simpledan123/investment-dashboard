from fastapi import APIRouter, HTTPException
from datetime import datetime

from services.forex_service import ForexService
from schemas import ExchangeRateResponse

router = APIRouter()
forex_service = ForexService()


@router.get("/", response_model=ExchangeRateResponse)
async def get_exchange_rate():
    """현재 USD/KRW 환율 조회"""
    rate = forex_service.get_usd_to_krw()
    
    if not rate:
        raise HTTPException(
            status_code=503,
            detail="환율 정보를 가져올 수 없습니다"
        )
    
    return ExchangeRateResponse(
        usd_to_krw=rate,
        updated_at=datetime.now()
    )
