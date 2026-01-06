import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ForexService {
  private readonly logger = new Logger(ForexService.name);
  private cache: number | null = null;
  private cacheTime: Date | null = null;
  private readonly cacheDuration = 5 * 60 * 1000; // 5분

  constructor(private configService: ConfigService) {}

  async getUsdToKrw(): Promise<number | null> {
    const now = new Date();

    // 캐시 확인
    if (this.cache && this.cacheTime) {
      const elapsed = now.getTime() - this.cacheTime.getTime();
      if (elapsed < this.cacheDuration) {
        this.logger.debug(`Using cached exchange rate: ${this.cache}`);
        return this.cache;
      }
    }

    // API 호출
    try {
      const apiUrl = this.configService.get('EXCHANGE_RATE_API_URL');
      this.logger.log('Fetching exchange rate from API...');
      
      const response = await axios.get(apiUrl, { timeout: 10000 });
      const krwRate = response.data.rates?.KRW;

      if (krwRate) {
        this.cache = parseFloat(krwRate);
        this.cacheTime = now;
        this.logger.log(`Exchange rate updated: ${this.cache}`);
        return this.cache;
      }

      this.logger.warn('KRW rate not found in API response');
      return this.cache; // 실패시 캐시 반환
    } catch (error) {
      this.logger.error(`Error fetching exchange rate: ${error.message}`);
      return this.cache; // 실패시 캐시 반환
    }
  }

  clearCache(): void {
    this.cache = null;
    this.cacheTime = null;
    this.logger.log('Exchange rate cache cleared');
  }
}