import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionResponseDto, TransactionListResponseDto } from './dto/transaction-response.dto';

@ApiTags('거래')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: '거래 입력 (매수/매도)' })
  @ApiResponse({ status: 201, type: TransactionResponseDto })
  @ApiResponse({ status: 503, description: '환율 정보를 가져올 수 없습니다' })
  create(@Body() createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto> {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: '거래 내역 조회' })
  @ApiQuery({ name: 'ticker', required: false, description: '종목 티커' })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 100 })
  @ApiResponse({ status: 200, type: TransactionListResponseDto })
  findAll(
    @Query('ticker') ticker?: string,
    @Query('skip') skip?: number,
    @Query('limit') limit?: number,
  ): Promise<TransactionListResponseDto> {
    return this.transactionsService.findAll(ticker, skip, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '거래 상세 조회' })
  @ApiResponse({ status: 404, description: '거래를 찾을 수 없습니다' })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '거래 정보 수정' })
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionsService.update(+id, updateTransactionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '거래 삭제' })
  @ApiResponse({ status: 204, description: '거래 삭제 성공' })
  @ApiResponse({ status: 404, description: '거래를 찾을 수 없습니다' })
  remove(@Param('id') id: string): Promise<void> {
    return this.transactionsService.remove(+id);
  }
}