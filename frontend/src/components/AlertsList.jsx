import React from 'react';
import { formatPercent, formatDateTime, getProfitColor } from '../utils/formatters';

const AlertsList = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">🔔 최근 알림</h2>
        <p className="text-gray-500 text-sm">최근 알림 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">🔔 최근 알림</h2>
      <div className="space-y-2">
        {alerts.map((alert) => {
          const color = getProfitColor(alert.change_percent);
          return (
            <div
              key={alert.id}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🚨</span>
                <div>
                  <span className="font-semibold text-gray-900">{alert.ticker}</span>
                  <span className={`ml-2 font-bold ${color}`}>
                    {formatPercent(alert.change_percent)}
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {formatDateTime(alert.sent_at)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertsList;
