import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { PortfolioSummaryDto } from './dto/portfolio-summary.dto';

@ApiTags('포트폴리오')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get('summary')
  @ApiOperation({ summary: '포트폴리오 전체 요약 정보' })
  @ApiResponse({ status: 200, type: PortfolioSummaryDto })
  getPortfolioSummary(): Promise<PortfolioSummaryDto> {
    return this.portfolioService.getPortfolioSummary();
  }
}