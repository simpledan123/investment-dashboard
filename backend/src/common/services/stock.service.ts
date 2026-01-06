import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  async getCurrentPrice(ticker: string): Promise<number | null> {
    try {
      // yfinance 대신 Yahoo Finance API 사용
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`;
      const response = await axios.get(url);
      
      const quote = response.data.chart.result[0].meta;
      return quote.regularMarketPrice || null;
    } catch (error) {
      this.logger.error(`Failed to fetch price for ${ticker}:`, error.message);
      return null;
    }
  }

  async getStockInfo(ticker: string) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`;
      const response = await axios.get(url);
      
      const result = response.data.chart.result[0];
      const quote = result.meta;
      
      return {
        ticker,
        name: quote.longName || quote.shortName || ticker,
        currentPrice: quote.regularMarketPrice,
        previousClose: quote.previousClose,
        dailyChange: quote.regularMarketChangePercent,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch info for ${ticker}:`, error.message);
      return {
        ticker,
        name: ticker,
        currentPrice: null,
        previousClose: null,
        dailyChange: null,
      };
    }
  }

  async getPreviousClose(ticker: string): Promise<number | null> {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`;
      const response = await axios.get(url);
      
      const quote = response.data.chart.result[0].meta;
      return quote.previousClose || null;
    } catch (error) {
      this.logger.error(`Failed to fetch previous close for ${ticker}:`, error.message);
      return null;
    }
  }

  calculateChangePercent(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }
}