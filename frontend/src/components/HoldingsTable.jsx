import React from 'react';
import { formatUSD, formatKRW, formatPercent, formatNumber, getProfitColor } from '../utils/formatters';

const HoldingsTable = ({ holdings, onStockClick }) => {
  if (!holdings || holdings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center">보유 종목이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                종목
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                현재가
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                수량
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                평가액
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                수익률
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                오늘
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {holdings.map((holding) => {
              const profitColor = getProfitColor(holding.profit_pct);
              const dailyColor = getProfitColor(holding.daily_change_pct);
              const isHighChange = Math.abs(holding.daily_change_pct || 0) >= 5;

              return (
                <tr
                  key={holding.ticker}
                  onClick={() => onStockClick(holding.ticker)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-bold text-gray-900 flex items-center">
                        {holding.ticker}
                        {isHighChange && <span className="ml-2">🔔</span>}
                      </div>
                      <div className="text-xs text-gray-500">{holding.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatUSD(holding.current_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatNumber(holding.shares, 2)}주
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatKRW(holding.value_krw)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-semibold ${profitColor}`}>
                    {formatPercent(holding.profit_pct)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm ${dailyColor} ${isHighChange ? 'font-bold' : ''}`}>
                    {formatPercent(holding.daily_change_pct)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HoldingsTable;
