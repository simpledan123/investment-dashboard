import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import logging
from core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """이메일 알림 서비스 (Gmail SMTP)"""
    
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.alert_email = settings.ALERT_EMAIL
    
    def is_configured(self) -> bool:
        """이메일 설정 완료 여부 확인"""
        return all([
            self.smtp_user,
            self.smtp_password,
            self.alert_email
        ])
    
    def send_price_alert(self, ticker: str, change_percent: float, current_price: float) -> bool:
        """가격 변동 알림 이메일 발송
        
        Args:
            ticker: 종목 심볼
            change_percent: 변동률 (%)
            current_price: 현재가
            
        Returns:
            발송 성공 여부
        """
        if not self.is_configured():
            logger.warning("Email settings not configured. Skipping email.")
            return False
        
        try:
            # 이메일 제목
            subject = f"🚨 [{ticker}] {change_percent:+.2f}% 가격 변동 알림"
            
            # 색상 결정
            color = '#EF4444' if change_percent < 0 else '#3B82F6'
            
            # HTML 본문
            body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: {color};">
                    가격 변동 알림
                </h2>
                <hr style="border: 1px solid #e5e7eb;">
                <div style="margin: 20px 0;">
                    <p><strong>종목:</strong> {ticker}</p>
                    <p>
                        <strong>변동률:</strong> 
                        <span style="font-size: 24px; font-weight: bold; color: {color};">
                            {change_percent:+.2f}%
                        </span>
                    </p>
                    <p><strong>현재가:</strong> ${current_price:.2f}</p>
                    <p><strong>시간:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                </div>
                <hr style="border: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                    이 알림은 {settings.PRICE_ALERT_THRESHOLD}% 이상의 가격 변동 발생시 자동으로 전송됩니다.
                </p>
            </body>
            </html>
            """
            
            # 메시지 생성
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.smtp_user
            msg['To'] = self.alert_email
            
            html_part = MIMEText(body, 'html', 'utf-8')
            msg.attach(html_part)
            
            # SMTP 전송
            with smtplib.SMTP_SSL(self.smtp_host, self.smtp_port, timeout=10) as server:
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Alert email sent: {ticker} ({change_percent:+.2f}%)")
            return True
            
        except smtplib.SMTPException as e:
            logger.error(f"SMTP error sending email: {e}")
            return False
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False
    
    def test_connection(self) -> bool:
        """이메일 서버 연결 테스트
        
        Returns:
            연결 성공 여부
        """
        if not self.is_configured():
            logger.warning("Email settings not configured")
            return False
        
        try:
            with smtplib.SMTP_SSL(self.smtp_host, self.smtp_port, timeout=10) as server:
                server.login(self.smtp_user, self.smtp_password)
            logger.info("Email connection test successful")
            return True
        except smtplib.SMTPException as e:
            logger.error(f"SMTP connection test failed: {e}")
            return False
        except Exception as e:
            logger.error(f"Email connection test failed: {e}")
            return False
