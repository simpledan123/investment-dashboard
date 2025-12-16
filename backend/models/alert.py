from sqlalchemy import Column, Integer, String, Numeric, DateTime
from sqlalchemy.sql import func
from database import Base


class Alerts(Base):
    """가격 변동 알림 기록 테이블"""
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String(10), nullable=False, index=True)
    change_percent = Column(Numeric(5, 2), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    def __repr__(self):
        return f"<Alert(ticker={self.ticker}, change={self.change_percent}%)>"
