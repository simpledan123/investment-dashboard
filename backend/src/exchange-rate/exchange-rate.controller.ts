import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExchangeRateService } from './exchange-rate.service';
import { ExchangeRateResponseDto } from './dto/exchange-rate-response.dto';

@ApiTags('환율')
@Controller('exchange-rate')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get()
  @ApiOperation({ summary: '현재 USD/KRW 환율 조회' })
  @ApiResponse({ status: 200, type: ExchangeRateResponseDto })
  getCurrentRate(): Promise<ExchangeRateResponseDto> {
    return this.exchangeRateService.getCurrentRate();
  }
}