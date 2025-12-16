from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
import logging

from models import Transactions
from schemas.transaction import TransactionCreate
from services.forex_service import ForexService
from crud import holdings as holdings_crud

logger = logging.getLogger(__name__)

forex_service = ForexService()


def create_transaction(db: Session, transaction: TransactionCreate) -> Transactions:
    """거래 생성
    
    Args:
        db: 데이터베이스 세션
        transaction: 거래 생성 데이터
        
    Returns:
        생성된 Transaction 객체
        
    Raises:
        ValueError: 환율 조회 실패시
    """
    # 종목이 없으면 자동 생성
    holdings_crud.get_or_create_holding(db, transaction.ticker)
    
    # 거래 시점 환율 조회
    exchange_rate = forex_service.get_usd_to_krw()
    if not exchange_rate:
        raise ValueError("환율 정보를 가져올 수 없습니다")
    
    # 거래 생성
    new_transaction = Transactions(
        ticker=transaction.ticker.upper(),
        type=transaction.type,
        shares=transaction.shares,
        price_usd=transaction.price_usd,
        exchange_rate=exchange_rate,
        transaction_time=transaction.transaction_time
    )
    
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    
    logger.info(f"Created transaction: {transaction.ticker} {transaction.type} {transaction.shares}주")
    return new_transaction


def get_transactions_by_ticker(
    db: Session,
    ticker: str,
    skip: int = 0,
    limit: int = 100
) -> List[Transactions]:
    """특정 종목의 거래 내역 조회
    
    Args:
        db: 데이터베이스 세션
        ticker: 종목 심볼
        skip: 건너뛸 개수
        limit: 최대 조회 개수
        
    Returns:
        거래 내역 리스트
    """
    return db.query(Transactions).filter(
        Transactions.ticker == ticker.upper()
    ).order_by(
        Transactions.transaction_time.desc()
    ).offset(skip).limit(limit).all()


def get_all_transactions(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> List[Transactions]:
    """모든 거래 내역 조회
    
    Args:
        db: 데이터베이스 세션
        skip: 건너뛸 개수
        limit: 최대 조회 개수
        
    Returns:
        거래 내역 리스트
    """
    return db.query(Transactions).order_by(
        Transactions.transaction_time.desc()
    ).offset(skip).limit(limit).all()


def get_transaction_by_id(db: Session, transaction_id: int) -> Optional[Transactions]:
    """ID로 거래 조회
    
    Args:
        db: 데이터베이스 세션
        transaction_id: 거래 ID
        
    Returns:
        Transaction 객체 또는 None
    """
    return db.query(Transactions).filter(Transactions.id == transaction_id).first()


def delete_transaction(db: Session, transaction_id: int) -> bool:
    """거래 삭제
    
    Args:
        db: 데이터베이스 세션
        transaction_id: 거래 ID
        
    Returns:
        삭제 성공 여부
    """
    transaction = get_transaction_by_id(db, transaction_id)
    if transaction:
        db.delete(transaction)
        db.commit()
        logger.info(f"Deleted transaction ID: {transaction_id}")
        return True
    return False


def get_transaction_count(db: Session, ticker: Optional[str] = None) -> int:
    """거래 내역 개수 조회
    
    Args:
        db: 데이터베이스 세션
        ticker: 특정 종목만 조회 (옵션)
        
    Returns:
        거래 개수
    """
    query = db.query(Transactions)
    if ticker:
        query = query.filter(Transactions.ticker == ticker.upper())
    return query.count()
