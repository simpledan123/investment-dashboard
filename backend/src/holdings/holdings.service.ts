import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holding } from './entities/holding.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { CreateHoldingDto } from './dto/create-holding.dto';
import { UpdateHoldingDto } from './dto/update-holding.dto';
import { HoldingResponseDto } from './dto/holding-response.dto';
import { HoldingDetailDto } from './dto/holding-detail.dto';
import { StockService } from '../common/services/stock.service';
import { ForexService } from '../common/services/forex.service';

@Injectable()
export class HoldingsService {
  constructor(
    @InjectRepository(Holding)
    private holdingsRepository: Repository<Holding>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private stockService: StockService,
    private forexService: ForexService,
  ) {}

  async create(createHoldingDto: CreateHoldingDto): Promise<Holding> {
    const holding = this.holdingsRepository.create(createHoldingDto);
    return await this.holdingsRepository.save(holding);
  }

  async findAll(): Promise<HoldingResponseDto[]> {
    const holdings = await this.holdingsRepository.find();
    const exchangeRate = await this.forexService.getUsdToKrw();
    
    const result: HoldingResponseDto[] = [];

    for (const holding of holdings) {
      // 총 보유 수량 계산
      const transactions = await this.transactionsRepository.find({
        where: { ticker: holding.ticker },
      });

      const totalShares = transactions.reduce((sum, t) => {
        return t.type === 'BUY' ? sum + Number(t.shares) : sum - Number(t.shares);
      }, 0);

      if (totalShares <= 0) continue;

      // 평균 매수가 계산
      const buyTransactions = transactions.filter(t => t.type === 'BUY');
      const totalCost = buyTransactions.reduce((sum, t) => sum + Number(t.shares) * Number(t.priceUsd), 0);
      const totalBuyShares = buyTransactions.reduce((sum, t) => sum + Number(t.shares), 0);
      const avgPrice = totalBuyShares > 0 ? totalCost / totalBuyShares : 0;

      // 현재가 조회
      const stockInfo = await this.stockService.getStockInfo(holding.ticker);
      const currentPrice = stockInfo.currentPrice;
      const dailyChange = stockInfo.dailyChange;

      // 평가액 및 수익률
let valueKrw: number | null = null;
let profitPct: number | null = null;

if (currentPrice && exchangeRate) {
  valueKrw = totalShares * currentPrice * exchangeRate;
  profitPct = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;
}

      result.push({
        ticker: holding.ticker,
        name: holding.name || holding.ticker,
        shares: totalShares,
        avgPrice,
        currentPrice,
        valueKrw,
        profitPct,
        dailyChangePct: dailyChange,
      });
    }

    // 수익률 높은 순 정렬
    result.sort((a, b) => (b.profitPct || -999) - (a.profitPct || -999));

    return result;
  }

  async findOne(ticker: string): Promise<HoldingDetailDto> {
    const holding = await this.holdingsRepository.findOne({
      where: { ticker: ticker.toUpperCase() },
    });

    if (!holding) {
      throw new NotFoundException(`Holding ${ticker} not found`);
    }

    // 거래 내역
    const transactions = await this.transactionsRepository.find({
      where: { ticker: holding.ticker },
      order: { transactionTime: 'DESC' },
    });

    // 총 보유 수량
    const totalShares = transactions.reduce((sum, t) => {
      return t.type === 'BUY' ? sum + Number(t.shares) : sum - Number(t.shares);
    }, 0);

    // 평균 매수가
    const buyTransactions = transactions.filter(t => t.type === 'BUY');
    const totalCost = buyTransactions.reduce((sum, t) => sum + Number(t.shares) * Number(t.priceUsd), 0);
    const totalBuyShares = buyTransactions.reduce((sum, t) => sum + Number(t.shares), 0);
    const avgPrice = totalBuyShares > 0 ? totalCost / totalBuyShares : 0;

    // 현재가
    const stockInfo = await this.stockService.getStockInfo(holding.ticker);
    const currentPrice = stockInfo.currentPrice;
    const dailyChange = stockInfo.dailyChange;

// 평가액 및 손익
const exchangeRate = await this.forexService.getUsdToKrw();
let valueKrw: number | null = null;
let profitPct: number | null = null;
let profitKrw: number | null = null;

if (currentPrice && exchangeRate) {
  valueKrw = totalShares * currentPrice * exchangeRate;
  const costKrw = buyTransactions.reduce((sum, t) => 
    sum + Number(t.shares) * Number(t.priceUsd) * Number(t.exchangeRate), 0
  );
  profitKrw = valueKrw - costKrw;
  profitPct = costKrw > 0 ? (profitKrw / costKrw) * 100 : 0;
}

    return {
      ticker: holding.ticker,
      name: holding.name || holding.ticker,
      currentPrice,
      dailyChangePct: dailyChange,
      totalShares,
      avgPrice,
      valueKrw,
      profitPct,
      profitKrw,
      transactions: transactions.map(t => ({
        id: t.id,
        ticker: t.ticker,
        type: t.type,
        shares: Number(t.shares),
        priceUsd: Number(t.priceUsd),
        exchangeRate: Number(t.exchangeRate),
        transactionTime: t.transactionTime,
        totalKrw: Number(t.shares) * Number(t.priceUsd) * Number(t.exchangeRate),
      })),
    };
  }

async update(id: number, updateHoldingDto: UpdateHoldingDto): Promise<Holding> {
  await this.holdingsRepository.update(id, updateHoldingDto);
  
  const holding = await this.holdingsRepository.findOne({ where: { id } });
  
  if (!holding) {
    throw new NotFoundException(`Holding with id ${id} not found`);
  }
  
  return holding;
}
  async remove(ticker: string): Promise<void> {
    const holding = await this.holdingsRepository.findOne({
      where: { ticker: ticker.toUpperCase() },
    });

    if (!holding) {
      throw new NotFoundException(`Holding ${ticker} not found`);
    }

    await this.holdingsRepository.remove(holding);
  }

  async getOrCreate(ticker: string): Promise<Holding> {
    const upper = ticker.toUpperCase();
    let holding = await this.holdingsRepository.findOne({
      where: { ticker: upper },
    });

    if (!holding) {
      const stockInfo = await this.stockService.getStockInfo(upper);
      holding = this.holdingsRepository.create({
        ticker: upper,
        name: stockInfo.name,
      });
      await this.holdingsRepository.save(holding);
    }

    return holding;
  }
}