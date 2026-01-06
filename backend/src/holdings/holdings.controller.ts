import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HoldingsService } from './holdings.service';
import { CreateHoldingDto } from './dto/create-holding.dto';
import { UpdateHoldingDto } from './dto/update-holding.dto';
import { HoldingResponseDto } from './dto/holding-response.dto';
import { HoldingDetailDto } from './dto/holding-detail.dto';

@ApiTags('보유종목')
@Controller('holdings')
export class HoldingsController {
  constructor(private readonly holdingsService: HoldingsService) {}

  @Post()
  @ApiOperation({ summary: '종목 추가' })
  @ApiResponse({ status: 201, description: '종목 추가 성공' })
  create(@Body() createHoldingDto: CreateHoldingDto) {
    return this.holdingsService.create(createHoldingDto);
  }

  @Get()
  @ApiOperation({ summary: '보유 종목 목록 조회 (현재가 포함)' })
  @ApiResponse({ status: 200, type: [HoldingResponseDto] })
  findAll(): Promise<HoldingResponseDto[]> {
    return this.holdingsService.findAll();
  }

  @Get(':ticker')
  @ApiOperation({ summary: '특정 종목 상세 정보 조회' })
  @ApiResponse({ status: 200, type: HoldingDetailDto })
  @ApiResponse({ status: 404, description: '종목을 찾을 수 없습니다' })
  findOne(@Param('ticker') ticker: string): Promise<HoldingDetailDto> {
    return this.holdingsService.findOne(ticker);
  }

  @Patch(':id')
  @ApiOperation({ summary: '종목 정보 수정' })
  update(@Param('id') id: string, @Body() updateHoldingDto: UpdateHoldingDto) {
    return this.holdingsService.update(+id, updateHoldingDto);
  }

  @Delete(':ticker')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '종목 삭제' })
  @ApiResponse({ status: 204, description: '종목 삭제 성공' })
  @ApiResponse({ status: 404, description: '종목을 찾을 수 없습니다' })
  remove(@Param('ticker') ticker: string): Promise<void> {
    return this.holdingsService.remove(ticker);
  }
}