from sqlalchemy.orm import Session
from typing import List
import logging

from models import Alerts

logger = logging.getLogger(__name__)


def get_recent_alerts(db: Session, limit: int = 10) -> List[Alerts]:
    """최근 알림 내역 조회
    
    Args:
        db: 데이터베이스 세션
        limit: 최대 조회 개수 (기본: 10)
        
    Returns:
        알림 내역 리스트
    """
    return db.query(Alerts).order_by(
        Alerts.sent_at.desc()
    ).limit(limit).all()


def get_alerts_by_ticker(
    db: Session,
    ticker: str,
    limit: int = 10
) -> List[Alerts]:
    """특정 종목의 알림 내역 조회
    
    Args:
        db: 데이터베이스 세션
        ticker: 종목 심볼
        limit: 최대 조회 개수
        
    Returns:
        알림 내역 리스트
    """
    return db.query(Alerts).filter(
        Alerts.ticker == ticker.upper()
    ).order_by(
        Alerts.sent_at.desc()
    ).limit(limit).all()


def get_alert_count(db: Session, ticker: str = None) -> int:
    """알림 개수 조회
    
    Args:
        db: 데이터베이스 세션
        ticker: 특정 종목만 조회 (옵션)
        
    Returns:
        알림 개수
    """
    query = db.query(Alerts)
    if ticker:
        query = query.filter(Alerts.ticker == ticker.upper())
    return query.count()


def delete_old_alerts(db: Session, days: int = 30) -> int:
    """오래된 알림 삭제
    
    Args:
        db: 데이터베이스 세션
        days: 보관 기간 (일)
        
    Returns:
        삭제된 알림 개수
    """
    from datetime import datetime, timedelta
    
    cutoff_date = datetime.now() - timedelta(days=days)
    
    deleted_count = db.query(Alerts).filter(
        Alerts.sent_at < cutoff_date
    ).delete()
    
    db.commit()
    logger.info(f"Deleted {deleted_count} old alerts (older than {days} days)")
    return deleted_count
