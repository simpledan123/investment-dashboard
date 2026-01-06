import { ApiProperty } from '@nestjs/swagger';

export class PortfolioSummaryDto {
  @ApiProperty({ example: 15000000, description: '총 평가액 (KRW)' })
  totalValueKrw: number;

  @ApiProperty({ example: 13000000, description: '총 매입 비용 (KRW)' })
  totalCostKrw: number;

  @ApiProperty({ example: 2000000, description: '총 손익 (KRW)' })
  totalProfitKrw: number;

  @ApiProperty({ example: 15.38, description: '총 수익률 (%)' })
  totalProfitPct: number;

  @ApiProperty({ example: 1320.5, description: '환율' })
  exchangeRate: number;

  @ApiProperty({ example: 5, description: '보유 종목 수' })
  holdingsCount: number;
}