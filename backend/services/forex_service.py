import requests
from typing import Optional
from datetime import datetime, timedelta
import logging
from core.config import settings

logger = logging.getLogger(__name__)


class ForexService:
    """환율 정보 조회 서비스 (ExchangeRate-API)"""
    
    def __init__(self):
        self.api_url = settings.EXCHANGE_RATE_API_URL
        self._cache: Optional[float] = None
        self._cache_time: Optional[datetime] = None
        self._cache_duration = timedelta(minutes=5)  # 5분 캐싱
    
    def get_usd_to_krw(self) -> Optional[float]:
        """현재 USD/KRW 환율 조회 (5분 캐싱 적용)"""
        now = datetime.now()
        
        # 캐시 유효성 체크
        if self._cache and self._cache_time:
            if now - self._cache_time < self._cache_duration:
                logger.debug(f"Using cached exchange rate: {self._cache}")
                return self._cache
        
        # API 호출
        try:
            logger.info("Fetching exchange rate from API...")
            response = requests.get(self.api_url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            krw_rate = data.get('rates', {}).get('KRW')
            if krw_rate:
                self._cache = float(krw_rate)
                self._cache_time = now
                logger.info(f"Exchange rate updated: {self._cache}")
                return self._cache
            
            logger.warning("KRW rate not found in API response")
            return None
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching exchange rate: {e}")
            # 실패시 캐시된 값 반환 (있다면)
            if self._cache:
                logger.info(f"Returning cached value due to API error: {self._cache}")
            return self._cache
    
    def get_historical_rate(self, date: datetime) -> Optional[float]:
        """특정 날짜의 환율 조회
        
        Note: exchangerate-api 무료 버전은 historical 미지원
        필요시 다른 API로 교체 (예: https://exchangeratesapi.io/)
        """
        logger.warning("Historical rates not supported, returning current rate")
        return self.get_usd_to_krw()
    
    def clear_cache(self):
        """캐시 초기화 (테스트용)"""
        self._cache = None
        self._cache_time = None
        logger.info("Exchange rate cache cleared")
