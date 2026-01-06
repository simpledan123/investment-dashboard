import { Injectable } from '@nestjs/common';
import { ExchangeRateResponseDto } from './dto/exchange-rate-response.dto';
import { ForexService } from '../common/services/forex.service';

@Injectable()
export class ExchangeRateService {
  constructor(private forexService: ForexService) {}

  async getCurrentRate(): Promise<ExchangeRateResponseDto> {
    const rate = await this.forexService.getUsdToKrw();

    return {
      usdToKrw: rate || 0,
      updatedAt: new Date(),
    };
  }

  create(createExchangeRateDto: any) {
    return 'This action adds a new exchangeRate';
  }

  findAll() {
    return `This action returns all exchangeRate`;
  }

  findOne(id: number) {
    return `This action returns a #${id} exchangeRate`;
  }

  update(id: number, updateExchangeRateDto: any) {
    return `This action updates a #${id} exchangeRate`;
  }

  remove(id: number) {
    return `This action removes a #${id} exchangeRate`;
  }
}