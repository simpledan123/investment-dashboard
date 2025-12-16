from pydantic import BaseModel, Field
from typing import Optional


class HoldingBase(BaseModel):
    """Holdings 기본 스키마"""
    ticker: str = Field(..., min_length=1, max_length=10)
    name: str


class HoldingResponse(BaseModel):
    """보유 종목 응답"""
    ticker: str
    name: str
    shares: float
    avg_price: float
    current_price: Optional[float] = None
    value_krw: Optional[float] = None
    profit_pct: Optional[float] = None
    daily_change_pct: Optional[float] = None
    
    class Config:
        from_attributes = True


class HoldingDetail(HoldingResponse):
    """보유 종목 상세 (거래내역 포함)"""
    total_shares: float
    profit_krw: Optional[float] = None
