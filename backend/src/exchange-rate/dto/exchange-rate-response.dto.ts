import { ApiProperty } from '@nestjs/swagger';

export class ExchangeRateResponseDto {
  @ApiProperty({ example: 1320.5 })
  usdToKrw: number;

  @ApiProperty()
  updatedAt: Date;
}