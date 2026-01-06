import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionResponseDto, TransactionListResponseDto } from './dto/transaction-response.dto';
import { ForexService } from '../common/services/forex.service';
import { HoldingsService } from '../holdings/holdings.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private forexService: ForexService,
    private holdingsService: HoldingsService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto> {
    // 종목 자동 생성
    await this.holdingsService.getOrCreate(createTransactionDto.ticker);

    // 환율 조회
    const exchangeRate = await this.forexService.getUsdToKrw();
    if (!exchangeRate) {
      throw new Error('환율 정보를 가져올 수 없습니다');
    }

    // 거래 생성
    const transaction = this.transactionsRepository.create({
      ...createTransactionDto,
      ticker: createTransactionDto.ticker.toUpperCase(),
      exchangeRate,
    });

    const saved = await this.transactionsRepository.save(transaction);

    return {
      id: saved.id,
      ticker: saved.ticker,
      type: saved.type,
      shares: Number(saved.shares),
      priceUsd: Number(saved.priceUsd),
      exchangeRate: Number(saved.exchangeRate),
      transactionTime: saved.transactionTime,
      totalKrw: Number(saved.shares) * Number(saved.priceUsd) * Number(saved.exchangeRate),
      createdAt: saved.createdAt,
    };
  }

  async findAll(
    ticker?: string,
    skip: number = 0,
    limit: number = 100,
  ): Promise<TransactionListResponseDto> {
    const query = this.transactionsRepository.createQueryBuilder('transaction');

    if (ticker) {
      query.where('transaction.ticker = :ticker', { ticker: ticker.toUpperCase() });
    }

    const [transactions, totalCount] = await query
      .orderBy('transaction.transactionTime', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      transactions: transactions.map(t => ({
        id: t.id,
        ticker: t.ticker,
        type: t.type,
        shares: Number(t.shares),
        priceUsd: Number(t.priceUsd),
        exchangeRate: Number(t.exchangeRate),
        transactionTime: t.transactionTime,
        totalKrw: Number(t.shares) * Number(t.priceUsd) * Number(t.exchangeRate),
        createdAt: t.createdAt,
      })),
      totalCount,
    };
  }

  async findOne(id: number): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({ where: { id } });
    
    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }
    
    return transaction;
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
    await this.transactionsRepository.update(id, updateTransactionDto);
    
    const transaction = await this.transactionsRepository.findOne({ where: { id } });
    
    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }
    
    return transaction;
  }

  async remove(id: number): Promise<void> {
    const transaction = await this.transactionsRepository.findOne({ where: { id } });
    
    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }
    
    await this.transactionsRepository.remove(transaction);
  }

  async getTransactionCount(ticker?: string): Promise<number> {
    if (ticker) {
      return this.transactionsRepository.count({
        where: { ticker: ticker.toUpperCase() },
      });
    }
    return this.transactionsRepository.count();
  }
}