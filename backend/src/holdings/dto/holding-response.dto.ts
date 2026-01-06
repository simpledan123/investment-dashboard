import { ApiProperty } from '@nestjs/swagger';

export class HoldingResponseDto {
  @ApiProperty({ example: 'VOO' })
  ticker: string;

  @ApiProperty({ example: 'Vanguard S&P 500 ETF' })
  name: string;

  @ApiProperty({ example: 10.5 })
  shares: number;

  @ApiProperty({ example: 445.30 })
  avgPrice: number;

  @ApiProperty({ example: 450.20, nullable: true })
  currentPrice: number | null;  // ← null 허용

  @ApiProperty({ example: 5900000, nullable: true })
  valueKrw: number | null;  // ← null 허용

  @ApiProperty({ example: 2.5, nullable: true })
  profitPct: number | null;  // ← null 허용

  @ApiProperty({ example: 1.2, nullable: true })
  dailyChangePct: number | null;  // ← null 허용
}