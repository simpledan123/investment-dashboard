from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """애플리케이션 설정"""
    
    # App
    APP_NAME: str = "Investment Portfolio API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/investment_db"
    
    # SMTP Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 465
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    ALERT_EMAIL: Optional[str] = None
    
    # External APIs
    EXCHANGE_RATE_API_URL: str = "https://api.exchangerate-api.com/v4/latest/USD"
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Alert Settings
    PRICE_ALERT_THRESHOLD: float = 5.0  # 5% 변동시 알림
    ALERT_CHECK_INTERVAL: int = 10  # 10분마다 체크
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """설정 싱글톤 (캐싱)"""
    return Settings()


# 편의를 위한 전역 변수
settings = get_settings()
