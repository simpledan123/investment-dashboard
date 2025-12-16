from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Literal


class TransactionBase(BaseModel):
    """Transaction 기본 스키마"""
    ticker: str = Field(..., min_length=1, max_length=10, description="종목 티커")
    type: Literal["BUY", "SELL"] = Field(..., description="매수/매도 구분")
    shares: float = Field(..., gt=0, description="수량")
    price_usd: float = Field(..., gt=0, description="매수/매도 단가 (USD)")


class TransactionCreate(TransactionBase):
    """거래 생성 요청"""
    transaction_time: datetime = Field(..., description="거래 일시")
    
    @validator('ticker')
    def ticker_uppercase(cls, v):
        return v.upper().strip()
    
    class Config:
        json_schema_extra = {
            "example": {
                "ticker": "VOO",
                "type": "BUY",
                "shares": 10.0,
                "price_usd": 445.30,
                "transaction_time": "2024-12-05T09:30:00"
            }
        }


class TransactionResponse(TransactionBase):
    """거래 내역 응답"""
    id: int
    exchange_rate: float
    transaction_time: datetime
    total_krw: float
    created_at: datetime
    
    class Config:
        from_attributes = True


class TransactionListResponse(BaseModel):
    """거래 내역 목록 응답"""
    transactions: list[TransactionResponse]
    total_count: int
