import { ApiProperty } from '@nestjs/swagger';

export class TransactionResponseDto {
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

  @ApiProperty()
  createdAt: Date;
}

export class TransactionListResponseDto {
  @ApiProperty({ type: [TransactionResponseDto] })
  transactions: TransactionResponseDto[];

  @ApiProperty()
  totalCount: number;
}