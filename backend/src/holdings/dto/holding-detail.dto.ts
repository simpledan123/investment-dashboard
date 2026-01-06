import { ApiProperty } from '@nestjs/swagger';

class TransactionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  ticker: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  shares: number;

  @ApiProperty()
  priceUsd: number;

  @ApiProperty()
  exchangeRate: number;

  @ApiProperty()
  transactionTime: Date;

  @ApiProperty()
  totalKrw: number;
}

export class HoldingDetailDto {
  @ApiProperty()
  ticker: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  currentPrice: number | null;  

  @ApiProperty({ nullable: true })
  dailyChangePct: number | null;  

  @ApiProperty()
  totalShares: number;

  @ApiProperty()
  avgPrice: number;

  @ApiProperty({ nullable: true })
  valueKrw: number | null;  

  @ApiProperty({ nullable: true })
  profitPct: number | null;  

  @ApiProperty({ nullable: true })
  profitKrw: number | null;  

  @ApiProperty({ type: [TransactionDto] })
  transactions: TransactionDto[];
}