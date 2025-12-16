from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from api.deps import get_db_session
from crud import alert as crud_alert
from schemas import AlertResponse, AlertListResponse

router = APIRouter()


@router.get("/", response_model=AlertListResponse)
async def get_alerts(
    ticker: str = None,
    limit: int = 10,
    db: Session = Depends(get_db_session)
):
    """최근 알림 내역 조회"""
    if ticker:
        alerts = crud_alert.get_alerts_by_ticker(db, ticker, limit)
        total_count = crud_alert.get_alert_count(db, ticker)
    else:
        alerts = crud_alert.get_recent_alerts(db, limit)
        total_count = crud_alert.get_alert_count(db)
    
    # Response 변환
    alerts_data = [
        AlertResponse(
            id=a.id,
            ticker=a.ticker,
            change_percent=float(a.change_percent),
            price=float(a.price),
            sent_at=a.sent_at
        )
        for a in alerts
    ]
    
    return AlertListResponse(
        alerts=alerts_data,
        total_count=total_count
    )
