import yfinance as yf
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)


class StockService:
    """주가 정보 조회 서비스 (yfinance)"""
    
    @staticmethod
    def get_current_price(ticker: str) -> Optional[float]:
        """현재가 조회"""
        try:
            stock = yf.Ticker(ticker)
            info = stock.info
            
            # 현재가 또는 최근 종가
            current_price = info.get('currentPrice') or info.get('regularMarketPrice')
            return float(current_price) if current_price else None
        except Exception as e:
            logger.error(f"Error fetching price for {ticker}: {e}")
            return None
    
    @staticmethod
    def get_stock_info(ticker: str) -> Dict:
        """종목 상세 정보 조회"""
        try:
            stock = yf.Ticker(ticker)
            info = stock.info
            
            return {
                "ticker": ticker,
                "name": info.get('longName') or info.get('shortName', ticker),
                "current_price": info.get('currentPrice') or info.get('regularMarketPrice'),
                "previous_close": info.get('previousClose'),
                "daily_change": info.get('regularMarketChangePercent'),
                "currency": info.get('currency', 'USD')
            }
        except Exception as e:
            logger.error(f"Error fetching info for {ticker}: {e}")
            return {
                "ticker": ticker,
                "name": ticker,
                "current_price": None,
                "previous_close": None,
                "daily_change": None,
                "currency": "USD"
            }
    
    @staticmethod
    def get_previous_close(ticker: str) -> Optional[float]:
        """전일 종가 조회"""
        try:
            stock = yf.Ticker(ticker)
            return float(stock.info.get('previousClose', 0))
        except Exception as e:
            logger.error(f"Error fetching previous close for {ticker}: {e}")
            return None
    
    @staticmethod
    def calculate_change_percent(current: float, previous: float) -> float:
        """가격 변동률 계산"""
        if previous == 0:
            return 0.0
        return ((current - previous) / previous) * 100
