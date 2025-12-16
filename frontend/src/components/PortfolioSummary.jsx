import React from 'react';
import { formatKRW, formatPercent, getProfitColor } from '../utils/formatters';

const PortfolioSummary = ({ summary }) => {
  if (!summary) return null;

  const profitColor = getProfitColor(summary.total_profit_pct);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">📈 포트폴리오 요약</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">총 평가액</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatKRW(summary.total_value_krw)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">총 수익률</p>
          <p className={`text-2xl font-bold ${profitColor}`}>
            {formatPercent(summary.total_profit_pct)}
            <span className="text-lg ml-2">
              ({summary.total_profit_krw >= 0 ? '+' : ''}{formatKRW(summary.total_profit_krw)})
            </span>
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">투자 원금</p>
          <p className="text-lg text-gray-700">
            {formatKRW(summary.total_cost_krw)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">보유 종목 수</p>
          <p className="text-lg text-gray-700">
            {summary.holdings_count}개
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;
