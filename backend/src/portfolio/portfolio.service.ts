import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holding } from '../holdings/entities/holding.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { PortfolioSummaryDto } from './dto/portfolio-summary.dto';
import { StockService } from '../common/services/stock.service';
import { ForexService } from '../common/services/forex.service';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Holding)
    private holdingsRepository: Repository<Holding>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private stockService: StockService,
    private forexService: ForexService,
  ) {}

  async getPortfolioSummary(): Promise<PortfolioSummaryDto> {
    const holdings = await this.holdingsRepository.find();
    const exchangeRate = await this.forexService.getUsdToKrw();

    if (!exchangeRate) {
      return {
        totalValueKrw: 0,
        totalCostKrw: 0,
        totalProfitKrw: 0,
        totalProfitPct: 0,
        exchangeRate: 0,
        holdingsCount: 0,
      };
    }

    let totalValue = 0;
    let totalCost = 0;
    let holdingsCount = 0;

    for (const holding of holdings) {
      // 거래 내역
      const transactions = await this.transactionsRepository.find({
        where: { ticker: holding.ticker },
      });

      // 보유 수량
      const totalShares = transactions.reduce((sum, t) => {
        return t.type === 'BUY' ? sum + Number(t.shares) : sum - Number(t.shares);
      }, 0);

      if (totalShares <= 0) continue;

      holdingsCount++;

      // 매입 비용
      const buyTransactions = transactions.filter(t => t.type === 'BUY');
      const costKrw = buyTransactions.reduce(
        (sum, t) => sum + Number(t.shares) * Number(t.priceUsd) * Number(t.exchangeRate),
        0,
      );
      totalCost += costKrw;

      // 현재 평가액
      const currentPrice = await this.stockService.getCurrentPrice(holding.ticker);
      if (currentPrice) {
        const valueKrw = totalShares * currentPrice * exchangeRate;
        totalValue += valueKrw;
      }
    }

    // 총 손익
    const totalProfit = totalValue - totalCost;
    const totalProfitPct = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    return {
      totalValueKrw: totalValue,
      totalCostKrw: totalCost,
      totalProfitKrw: totalProfit,
      totalProfitPct,
      exchangeRate,
      holdingsCount,
    };
  }

  create(createPortfolioDto: any) {
    return 'This action adds a new portfolio';
  }

  findAll() {
    return `This action returns all portfolio`;
  }

  findOne(id: number) {
    return `This action returns a #${id} portfolio`;
  }

  update(id: number, updatePortfolioDto: any) {
    return `This action updates a #${id} portfolio`;
  }

  remove(id: number) {
    return `This action removes a #${id} portfolio`;
  }
}