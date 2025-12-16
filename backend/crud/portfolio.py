from sqlalchemy.orm import Session
from sqlalchemy import func
import logging

from models import Holdings, Transactions
from services.stock_service import StockService
from services.forex_service import ForexService

logger = logging.getLogger(__name__)

stock_service = StockService()
forex_service = ForexService()


def get_portfolio_summary(db: Session) -> dict:
    """포트폴리오 전체 요약 정보
    
    Args:
        db: 데이터베이스 세션
        
    Returns:
        포트폴리오 요약 dict
    """
    holdings = db.query(Holdings).all()
    exchange_rate = forex_service.get_usd_to_krw()
    
    if not exchange_rate:
        logger.warning("환율 정보를 가져올 수 없습니다")
        exchange_rate = 0
    
    total_value = 0.0  # 총 평가액 (KRW)
    total_cost = 0.0   # 총 매입 비용 (KRW)
    holdings_count = 0
    
    for holding in holdings:
        # 보유 수량 계산
        total_shares = db.query(
            func.sum(
                func.case(
                    (Transactions.type == 'BUY', Transactions.shares),
                    else_=-Transactions.shares
                )
            )
        ).filter(Transactions.ticker == holding.ticker).scalar() or 0
        
        if total_shares <= 0:
            continue
        
        holdings_count += 1
        
        # 매입 비용 계산
        buy_transactions = db.query(Transactions).filter(
            Transactions.ticker == holding.ticker,
            Transactions.type == 'BUY'
        ).all()
        
        cost_krw = sum(
            t.shares * t.price_usd * t.exchange_rate
            for t in buy_transactions
        )
        total_cost += cost_krw
        
        # 현재 평가액 계산
        current_price = stock_service.get_current_price(holding.ticker)
        if current_price and exchange_rate:
            value_krw = float(total_shares) * current_price * exchange_rate
            total_value += value_krw
    
    # 총 손익 및 수익률
    total_profit = total_value - total_cost
    total_profit_pct = (total_profit / total_cost * 100) if total_cost > 0 else 0
    
    return {
        "total_value_krw": total_value,
        "total_cost_krw": total_cost,
        "total_profit_krw": total_profit,
        "total_profit_pct": total_profit_pct,
        "exchange_rate": exchange_rate,
        "holdings_count": holdings_count
    }
