from pydantic import BaseModel
from typing import List
from schemas.transaction import TransactionResponse


class StockDetailResponse(BaseModel):
    """종목 상세 정보 응답"""
    ticker: str
    name: str
    current_price: float | None
    daily_change_pct: float | None
    total_shares: float
    avg_price: float
    value_krw: float | None
    profit_pct: float | None
    profit_krw: float | None
    transactions: List[TransactionResponse]


class PortfolioSummaryResponse(BaseModel):
    """포트폴리오 전체 요약"""
    total_value_krw: float
    total_cost_krw: float
    total_profit_krw: float
    total_profit_pct: float
    exchange_rate: float
    holdings_count: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_value_krw": 15000000,
                "total_cost_krw": 13000000,
                "total_profit_krw": 2000000,
                "total_profit_pct": 15.38,
                "exchange_rate": 1320.50,
                "holdings_count": 5
            }
        }
