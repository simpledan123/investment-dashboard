import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Holding } from '../../holdings/entities/holding.entity';
import { Alert } from '../../alerts/entities/alert.entity';
import { StockService } from './stock.service';
import { AlertsService } from '../../alerts/alerts.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private readonly alertThreshold: number;

  constructor(
    @InjectRepository(Holding)
    private holdingsRepository: Repository<Holding>,
    @InjectRepository(Alert)
    private alertsRepository: Repository<Alert>,
    private stockService: StockService,
    private alertsService: AlertsService,
    private configService: ConfigService,
  ) {
    this.alertThreshold = this.configService.get('PRICE_ALERT_THRESHOLD') || 5.0;
  }

  // 미국 증시 시간대 체크
  private isUsMarketOpen(): boolean {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const estTime = new Date(utc - 5 * 3600000); // EST (UTC-5)

    // 주말 제외
    const day = estTime.getDay();
    if (day === 0 || day === 6) return false;

    // 정규 거래 시간: 09:30 ~ 16:00 EST
    const hour = estTime.getHours();
    const minute = estTime.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    const marketOpen = 9 * 60 + 30; // 09:30
    const marketClose = 16 * 60; // 16:00

    return timeInMinutes >= marketOpen && timeInMinutes < marketClose;
  }

  // 10분마다 체크 (한국 시간 22:30 ~ 06:00)
  @Cron('*/10 22-23,0-5 * * 1-5', {
    name: 'price-check',
    timeZone: 'Asia/Seoul',
  })
  async checkPriceChanges() {
    if (!this.isUsMarketOpen()) {
      this.logger.debug('미국 증시 휴장 중 - 가격 체크 건너뜀');
      return;
    }

    this.logger.log(`가격 변동 체크 시작 - ${new Date().toLocaleString('ko-KR')}`);

    try {
      const holdings = await this.holdingsRepository.find();

      if (holdings.length === 0) {
        this.logger.debug('보유 종목 없음');
        return;
      }

      for (const holding of holdings) {
        try {
          await this.checkStockPrice(holding.ticker);
        } catch (error) {
          this.logger.error(`${holding.ticker} 처리 중 오류: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`가격 체크 중 오류: ${error.message}`);
    }
  }

  // 장 마감 직후 체크 (한국 시간 06:05)
  @Cron('5 6 * * 2-6', {
    name: 'market-close-check',
    timeZone: 'Asia/Seoul',
  })
  async marketCloseCheck() {
    this.logger.log('장 마감 최종 체크');
    await this.checkPriceChanges();
  }

  private async checkStockPrice(ticker: string) {
    // 현재가 및 전일 종가
    const currentPrice = await this.stockService.getCurrentPrice(ticker);
    const previousClose = await this.stockService.getPreviousClose(ticker);

    if (!currentPrice || !previousClose) {
      this.logger.warn(`${ticker}: 가격 정보 조회 실패`);
      return;
    }

    // 변동률 계산
    const changePercent = this.stockService.calculateChangePercent(currentPrice, previousClose);

    this.logger.debug(`${ticker}: $${currentPrice} (${changePercent.toFixed(2)}%)`);

    // 임계값 이상 변동시
    if (Math.abs(changePercent) >= this.alertThreshold) {
      await this.sendAlertIfNeeded(ticker, changePercent, currentPrice);
    }
  }

  private async sendAlertIfNeeded(ticker: string, changePercent: number, currentPrice: number) {
    // 중복 알림 방지: 최근 1시간 내 같은 종목 알림 확인
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const recentAlert = await this.alertsRepository.findOne({
      where: {
        ticker,
        sentAt: MoreThan(oneHourAgo),
      },
    });

    if (recentAlert) {
      this.logger.log(`${ticker}: 최근 알림 이미 발송됨 (중복 방지)`);
      return;
    }

    // 알림 생성
    try {
      await this.alertsService.create(ticker, changePercent, currentPrice);
      this.logger.log(`✅ 알림 발송: ${ticker} ${changePercent.toFixed(2)}%`);

      // TODO: 실제 이메일 발송은 나중에 구현
      // await this.emailService.sendPriceAlert(ticker, changePercent, currentPrice);
    } catch (error) {
      this.logger.error(`${ticker} 알림 발송 실패: ${error.message}`);
    }
  }

  // 수동 테스트용
  async testAlert(ticker: string) {
    this.logger.log(`수동 테스트: ${ticker}`);
    await this.checkStockPrice(ticker);
  }
}