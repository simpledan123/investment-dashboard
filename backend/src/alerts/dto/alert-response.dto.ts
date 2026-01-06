import { ApiProperty } from '@nestjs/swagger';

export class AlertResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  ticker: string;

  @ApiProperty()
  changePercent: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  sentAt: Date;
}

export class AlertListResponseDto {
  @ApiProperty({ type: [AlertResponseDto] })
  alerts: AlertResponseDto[];

  @ApiProperty()
  totalCount: number;
}
