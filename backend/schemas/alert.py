from pydantic import BaseModel
from datetime import datetime


class AlertResponse(BaseModel):
    """알림 내역 응답"""
    id: int
    ticker: str
    change_percent: float
    price: float
    sent_at: datetime
    
    class Config:
        from_attributes = True


class AlertListResponse(BaseModel):
    """알림 목록 응답"""
    alerts: list[AlertResponse]
    total_count: int
