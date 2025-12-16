from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Holdings(Base):
    """보유 종목 테이블"""
    __tablename__ = "holdings"
    
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String(10), unique=True, nullable=False, index=True)
    name = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    transactions = relationship("Transactions", back_populates="holding", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Holdings(ticker={self.ticker}, name={self.name})>"
