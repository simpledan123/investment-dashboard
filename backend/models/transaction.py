from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Transactions(Base):
    """거래 내역 테이블"""
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String(10), ForeignKey("holdings.ticker", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(4), nullable=False)  # 'BUY' or 'SELL'
    shares = Column(Numeric(10, 4), nullable=False)
    price_usd = Column(Numeric(10, 2), nullable=False)
    exchange_rate = Column(Numeric(10, 2), nullable=False)
    transaction_time = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    holding = relationship("Holdings", back_populates="transactions")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("type IN ('BUY', 'SELL')", name="check_transaction_type"),
        CheckConstraint("shares > 0", name="check_shares_positive"),
        CheckConstraint("price_usd > 0", name="check_price_positive"),
        CheckConstraint("exchange_rate > 0", name="check_exchange_rate_positive"),
    )
    
    def __repr__(self):
        return f"<Transaction(ticker={self.ticker}, type={self.type}, shares={self.shares})>"
