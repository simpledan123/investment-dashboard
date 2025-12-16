from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timedelta
import pytz
import logging
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Holdings, Alerts
from services.stock_service import StockService
from services.email_service import EmailService
from core.config import settings

logger = logging.getLogger(__name__)


class PriceAlertScheduler:
    """가격 변동 모니터링 스케줄러 (미국 증시 시간)"""
    
    def __init__(self):
        self.scheduler = BackgroundScheduler(timezone='Asia/Seoul')
        self.stock_service = StockService()
        self.email_service = EmailService()
        self.alert_threshold = settings.PRICE_ALERT_THRESHOLD
    
    def is_us_market_open(self) -> bool:
        """미국 증시 정규장 오픈 여부 확인 (EST 기준)
        
        Returns:
            시장 개장 여부
        """
        now = datetime.now(pytz.timezone('America/New_York'))
        
        # 주말 제외
        if now.weekday() >= 5:  # Saturday(5), Sunday(6)
            return False
        
        # 정규 거래 시간: 09:30 ~ 16:00 EST
        market_open = now.hour > 9 or (now.hour == 9 and now.minute >= 30)
        market_close = now.hour < 16
        
        return market_open and market_close
    
    def check_price_changes(self):
        """모든 보유 종목의 가격 변동 체크 및 알림 발송"""
        if not self.is_us_market_open():
            logger.info("미국 증시 휴장 중 - 가격 체크 건너뜀")
            return
        
        logger.info(f"가격 변동 체크 시작 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        db: Session = SessionLocal()
        try:
            # 모든 보유 종목 조회
            holdings = db.query(Holdings).all()
            
            if not holdings:
                logger.info("보유 종목 없음")
                return
            
            for holding in holdings:
                ticker = holding.ticker
                
                try:
                    # 현재가 및 전일 종가 조회
                    current_price = self.stock_service.get_current_price(ticker)
                    previous_close = self.stock_service.get_previous_close(ticker)
                    
                    if not current_price or not previous_close:
                        logger.warning(f"{ticker}: 가격 정보 조회 실패")
                        continue
                    
                    # 변동률 계산
                    change_percent = self.stock_service.calculate_change_percent(
                        current_price, previous_close
                    )
                    
                    logger.debug(f"{ticker}: ${current_price:.2f} ({change_percent:+.2f}%)")
                    
                    # 임계값 이상 변동시 알림 처리
                    if abs(change_percent) >= self.alert_threshold:
                        self._send_alert_if_needed(db, ticker, change_percent, current_price)
                
                except Exception as e:
                    logger.error(f"{ticker} 처리 중 오류: {e}")
                    continue
        
        except Exception as e:
            logger.error(f"가격 체크 중 오류: {e}")
            db.rollback()
        finally:
            db.close()
    
    def _send_alert_if_needed(
        self,
        db: Session,
        ticker: str,
        change_percent: float,
        current_price: float
    ):
        """알림 필요시 발송 (중복 방지)
        
        Args:
            db: 데이터베이스 세션
            ticker: 종목 심볼
            change_percent: 변동률
            current_price: 현재가
        """
        # 중복 알림 방지: 최근 1시간 내 같은 종목 알림 확인
        one_hour_ago = datetime.now(pytz.UTC) - timedelta(hours=1)
        
        recent_alert = db.query(Alerts).filter(
            Alerts.ticker == ticker,
            Alerts.sent_at >= one_hour_ago
        ).first()
        
        if recent_alert:
            logger.info(f"{ticker}: 최근 알림 이미 발송됨 (중복 방지)")
            return
        
        # 알림 발송
        if self.email_service.send_price_alert(ticker, change_percent, current_price):
            # 알림 기록 저장
            alert = Alerts(
                ticker=ticker,
                change_percent=change_percent,
                price=current_price
            )
            db.add(alert)
            db.commit()
            logger.info(f"알림 발송 완료: {ticker} {change_percent:+.2f}%")
        else:
            logger.warning(f"알림 발송 실패: {ticker}")
    
    def start(self):
        """스케줄러 시작"""
        interval = settings.ALERT_CHECK_INTERVAL
        
        # 정규장 중 주기적 체크 (한국시간 22:30~06:00)
        self.scheduler.add_job(
            self.check_price_changes,
            CronTrigger(
                day_of_week='mon-fri',
                hour='22-23,0-5',
                minute=f'*/{interval}'
            ),
            id='regular_hours_check',
            replace_existing=True
        )
        
        # 장 마감 직후 최종 체크 (06:05)
        self.scheduler.add_job(
            self.check_price_changes,
            CronTrigger(
                day_of_week='mon-fri',
                hour='6',
                minute='5'
            ),
            id='market_close_check',
            replace_existing=True
        )
        
        self.scheduler.start()
        logger.info("가격 알림 스케줄러 시작")
        logger.info(f"  - 정규장 중: {interval}분마다 체크")
        logger.info("  - 마감 후: 06:05 최종 체크")
    
    def stop(self):
        """스케줄러 종료"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("스케줄러 종료")
