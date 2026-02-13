import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Transaction } from '../transactions/entities/transaction.entity';
import { PortfolioSummaryDto } from './dto/portfolio-summary.dto';
import { StockService } from '../common/services/stock.service';
import { ForexService } from '../common/services/forex.service';

type TxAggRow = {
  ticker: string;
  net_shares: string | number;
  cost_krw: string | number;
};

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    private readonly stockService: StockService,
    private readonly forexService: ForexService,
  ) {}

  async getPortfolioSummary(): Promise<PortfolioSummaryDto> {
    // 1) 현재 환율
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

    // 2) DB에서 ticker별 보유수량/매입원가를 "한 번에" 집계
    const rows = await this.transactionsRepository
      .createQueryBuilder('t')
      .select('t.ticker', 'ticker')
      .addSelect(
        "SUM(CASE WHEN t.type = 'BUY' THEN t.shares ELSE -t.shares END)",
        'net_shares',
      )
      .addSelect(
        "SUM(CASE WHEN t.type = 'BUY' THEN t.shares * t.priceUsd * t.exchangeRate ELSE 0 END)",
        'cost_krw',
      )
      .groupBy('t.ticker')
      .getRawMany<TxAggRow>();

    const active = rows
      .map((r) => ({
        ticker: r.ticker,
        netShares: Number(r.net_shares ?? 0),
        costKrw: Number(r.cost_krw ?? 0),
      }))
      .filter((r) => r.netShares > 0);

    if (active.length === 0) {
      return {
        totalValueKrw: 0,
        totalCostKrw: 0,
        totalProfitKrw: 0,
        totalProfitPct: 0,
        exchangeRate,
        holdingsCount: 0,
      };
    }

    // 3) 현재가 조회는 병렬로 (외부 호출)
    const prices = await Promise.all(
      active.map((r) => this.stockService.getCurrentPrice(r.ticker)),
    );

    let totalValueKrw = 0;
    let totalCostKrw = 0;
    let holdingsCount = 0;

    active.forEach((r, idx) => {
      holdingsCount += 1;
      totalCostKrw += r.costKrw;

      const currentPrice = prices[idx];
      if (currentPrice) {
        totalValueKrw += r.netShares * currentPrice * exchangeRate;
      }
    });

    const totalProfitKrw = totalValueKrw - totalCostKrw;
    const totalProfitPct = totalCostKrw > 0 ? (totalProfitKrw / totalCostKrw) * 100 : 0;

    return {
      totalValueKrw,
      totalCostKrw,
      totalProfitKrw,
      totalProfitPct,
      exchangeRate,
      holdingsCount,
    };
  }
}
