import React from 'react';
import { formatNumber, formatDateTime } from '../utils/formatters';

const ExchangeRateCard = ({ exchangeRate, updatedAt }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">💵 현재 환율</p>
          <p className="text-3xl font-bold text-gray-900">
            USD/KRW: {formatNumber(exchangeRate, 2)}원
          </p>
          {updatedAt && (
            <p className="text-xs text-gray-400 mt-2">
              업데이트: {formatDateTime(updatedAt)}
            </p>
          )}
        </div>
        <div className="text-4xl">💱</div>
      </div>
    </div>
  );
};

export default ExchangeRateCard;
