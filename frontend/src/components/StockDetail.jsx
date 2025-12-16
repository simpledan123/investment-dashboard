import React from 'react';
import { formatUSD, formatKRW, formatPercent, formatNumber, formatDateTime, getProfitColor } from '../utils/formatters';

const StockDetail = ({ stock, onBack }) => {
  if (!stock) return null;

  const profitColor = getProfitColor(stock.profit_pct);
  const dailyColor = getProfitColor(stock.daily_change_pct);

  return (
    <div className="space-y-6">
      {/* 뒤로 가기 버튼 */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
      >
        ← 뒤로
      </button>

      {/* 종목 헤더 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {stock.ticker} - {stock.name}
        </h1>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-gray-500">현재가</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatUSD(stock.current_price)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">오늘</p>
            <p className={`text-xl font-semibold ${dailyColor}`}>
              {formatPercent(stock.daily_change_pct)}
            </p>
          </div>
        </div>
      </div>

      {/* 보유 요약 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">보유 현황</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">보유 수량</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatNumber(stock.total_shares, 2)}주
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">평균 매수가</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatUSD(stock.avg_price)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">현재 평가액</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatKRW(stock.value_krw)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">총 수익률</p>
            <p className={`text-lg font-semibold ${profitColor}`}>
              {formatPercent(stock.profit_pct)}
            </p>
          </div>
        </div>
      </div>

      {/* 거래 내역 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">📝 거래 내역</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  날짜/시간
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  구분
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  수량
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  단가 (USD)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  환율
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  총액 (KRW)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stock.transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(tx.transaction_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        tx.type === 'BUY'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tx.type === 'BUY' ? '매수' : '매도'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatNumber(tx.shares, 2)}주
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatUSD(tx.price_usd)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatNumber(tx.exchange_rate, 2)}원
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                    {formatKRW(tx.total_krw)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 손익 계산 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">💰 손익 계산</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">총 투입금액</span>
            <span className="font-semibold text-gray-900">
              {formatKRW(stock.value_krw - (stock.profit_krw || 0))}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">현재 평가액</span>
            <span className="font-semibold text-gray-900">
              {formatKRW(stock.value_krw)}
            </span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2">
            <span className="text-gray-600">미실현 손익</span>
            <span className={`font-bold text-lg ${profitColor}`}>
              {stock.profit_krw >= 0 ? '+' : ''}{formatKRW(stock.profit_krw)} ({formatPercent(stock.profit_pct)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
