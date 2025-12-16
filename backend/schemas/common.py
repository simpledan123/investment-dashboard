from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MessageResponse(BaseModel):
    """일반 메시지 응답"""
    message: str
    detail: Optional[str] = None


class ExchangeRateResponse(BaseModel):
    """환율 정보 응답"""
    usd_to_krw: float
    updated_at: datetime


class HealthCheckResponse(BaseModel):
    """헬스 체크 응답"""
    status: str
    timestamp: datetime
