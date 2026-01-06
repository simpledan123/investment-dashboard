import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { AlertListResponseDto } from './dto/alert-response.dto';

@ApiTags('알림')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: '최근 알림 내역 조회' })
  @ApiQuery({ name: 'ticker', required: false, description: '종목 티커' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, type: AlertListResponseDto })
  findAll(
    @Query('ticker') ticker?: string,
    @Query('limit') limit?: number,
  ): Promise<AlertListResponseDto> {
    return this.alertsService.findAll(ticker, limit);
  }
}