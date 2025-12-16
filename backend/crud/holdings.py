from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import logging

from models import Holdings, Transactions
from services.stock_service import StockService
from services.forex_service import ForexService

logger = logging.getLogger(__name__)

stock_service = StockService()
forex_service = ForexService()


def get_holding_by_ticker(db: Session, ticker: str) -> Optional[Holdings]:
    """티커로 종목 조회
    
    Args:
        db: 데이터베이스 세션
        ticker: 종목 심볼
        
    Returns:
        Holdings 객체 또는 None
    """
    return db.query(Holdings).filter(Holdings.ticker == ticker.upper()).first()


def create_holding(db: Session, ticker: str, name: str) -> Holdings:
    """새 종목 생성
    
    Args:
        db: 데이터베이스 세션
        ticker: 종목 심볼
        name: 종목 이름
        
    Returns:
        생성된 Holdings 객체
    """
    holding = Holdings(ticker=ticker.upper(), name=name)
    db.add(holding)
    db.commit()
    db.refresh(holding)
    logger.info(f"Created new holding: {ticker}")
    return holding


def get_or_create_holding(db: Session, ticker: str) -> Holdings:
    """종목 조회 또는 생성 (없으면 자동으로 생성)
    
    Args:
        db: 데이터베이스 세션
        ticker: 종목 심볼
        
    Returns:
        Holdings 객체
    """
    ticker = ticker.upper()
    holding = get_holding_by_ticker(db, ticker)
    
    if not holding:
        # yfinance에서 종목 정보 조회
        stock_info = stock_service.get_stock_info(ticker)
        name = stock_info.get('name', ticker)
        holding = create_holding(db, ticker, name)
    
    return holding


def get_all_holdings_with_stats(db: Session) -> List[dict]:
    """모든 보유 종목 + 통계 정보 조회
    
    Args:
        db: 데이터베이스 세션
        
    Returns:
        종목별 상세 정보 리스트
    """
    holdings = db.query(Holdings).all()
    exchange_rate = forex_service.get_usd_to_krw()
    
    result = []
    
    for holding in holdings:
        # 총 보유 수량 계산 (매수 - 매도)
        total_shares = db.query(
            func.sum(
                func.case(
                    (Transactions.type == 'BUY', Transactions.shares),
                    else_=-Transactions.shares
                )
            )
        ).filter(Transactions.ticker == holding.ticker).scalar() or 0
        
        # 보유 수량이 0 이하면 제외
        if total_shares <= 0:
            continue
        
        # 평균 매수가 계산
        buy_transactions = db.query(Transactions).filter(
            Transactions.ticker == holding.ticker,
            Transactions.type == 'BUY'
        ).all()
        
        if not buy_transactions:
            continue
        
        total_cost = sum(t.shares * t.price_usd for t in buy_transactions)
        total_buy_shares = sum(t.shares for t in buy_transactions)
        avg_price = total_cost / total_buy_shares if total_buy_shares > 0 else 0
        
        # 현재가 조회
        stock_info = stock_service.get_stock_info(holding.ticker)
        current_price = stock_info.get('current_price')
        daily_change = stock_info.get('daily_change')
        
        # 평가액 및 수익률 계산
        value_krw = None
        profit_pct = None
        
        if current_price and exchange_rate:
            value_krw = float(total_shares) * current_price * exchange_rate
            profit_pct = ((current_price - avg_price) / avg_price * 100) if avg_price > 0 else 0
        
        result.append({
            "ticker": holding.ticker,
            "name": holding.name or holding.ticker,
            "shares": float(total_shares),
            "avg_price": avg_price,
            "current_price": current_price,
            "value_krw": value_krw,
            "profit_pct": profit_pct,
            "daily_change_pct": daily_change
        })
    
    # 수익률 높은 순으로 정렬
    result.sort(key=lambda x: x['profit_pct'] if x['profit_pct'] is not None else -999, reverse=True)
    return result


def get_holding_detail(db: Session, ticker: str) -> Optional[dict]:
    """특정 종목 상세 정보 조회
    
    Args:
        db: 데이터베이스 세션
        ticker: 종목 심볼
        
    Returns:
        종목 상세 정보 dict 또는 None
    """
    ticker = ticker.upper()
    holding = get_holding_by_ticker(db, ticker)
    
    if not holding:
        return None
    
    # 거래 내역 조회
    transactions = db.query(Transactions).filter(
        Transactions.ticker == ticker
    ).order_by(Transactions.transaction_time.desc()).all()
    
    # 총 보유 수량
    total_shares = db.query(
        func.sum(
            func.case(
                (Transactions.type == 'BUY', Transactions.shares),
                else_=-Transactions.shares
            )
        )
    ).filter(Transactions.ticker == ticker).scalar() or 0
    
    # 평균 매수가
    buy_transactions = [t for t in transactions if t.type == 'BUY']
    total_cost = sum(t.shares * t.price_usd for t in buy_transactions)
    total_buy_shares = sum(t.shares for t in buy_transactions)
    avg_price = total_cost / total_buy_shares if total_buy_shares > 0 else 0
    
    # 현재가 조회
    stock_info = stock_service.get_stock_info(ticker)
    current_price = stock_info.get('current_price')
    daily_change = stock_info.get('daily_change')
    
    # 평가액 및 손익
    exchange_rate = forex_service.get_usd_to_krw()
    value_krw = None
    profit_pct = None
    profit_krw = None
    
    if current_price and exchange_rate:
        value_krw = float(total_shares) * current_price * exchange_rate
        cost_krw = sum(t.shares * t.price_usd * t.exchange_rate for t in buy_transactions)
        profit_krw = value_krw - cost_krw
        profit_pct = (profit_krw / cost_krw * 100) if cost_krw > 0 else 0
    
    # 거래 내역 변환
    transactions_data = []
    for t in transactions:
        transactions_data.append({
            "id": t.id,
            "ticker": t.ticker,
            "type": t.type,
            "shares": float(t.shares),
            "price_usd": float(t.price_usd),
            "exchange_rate": float(t.exchange_rate),
            "transaction_time": t.transaction_time,
            "total_krw": float(t.shares * t.price_usd * t.exchange_rate)
        })
    
    return {
        "ticker": ticker,
        "name": holding.name or ticker,
        "current_price": current_price,
        "daily_change_pct": daily_change,
        "total_shares": float(total_shares),
        "avg_price": avg_price,
        "value_krw": value_krw,
        "profit_pct": profit_pct,
        "profit_krw": profit_krw,
        "transactions": transactions_data
    }


def delete_holding(db: Session, ticker: str) -> bool:
    """종목 삭제
    
    Args:
        db: 데이터베이스 세션
        ticker: 종목 심볼
        
    Returns:
        삭제 성공 여부
    """
    holding = get_holding_by_ticker(db, ticker)
    if holding:
        db.delete(holding)
        db.commit()
        logger.info(f"Deleted holding: {ticker}")
        return True
    return False
