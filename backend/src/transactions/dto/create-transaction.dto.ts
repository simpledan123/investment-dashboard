import { IsString, IsNotEmpty, IsNumber, IsPositive, IsIn, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateTransactionDto {
  @ApiProperty({ example: 'VOO', description: '종목 티커' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @Transform(({ value }) => value.toUpperCase())
  ticker: string;

  @ApiProperty({ example: 'BUY', enum: ['BUY', 'SELL'] })
  @IsString()
  @IsIn(['BUY', 'SELL'])
  type: 'BUY' | 'SELL';

  @ApiProperty({ example: 10.5, description: '수량' })
  @IsNumber()
  @IsPositive()
  shares: number;

  @ApiProperty({ example: 445.30, description: '매수/매도 단가 (USD)' })
  @IsNumber()
  @IsPositive()
  priceUsd: number;

  @ApiProperty({ example: '2024-12-05T09:30:00Z', description: '거래 일시' })
  @IsDateString()
  transactionTime: Date;
}