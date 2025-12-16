import React, { useState } from 'react';
import { createTransaction } from '../api/client';

const TransactionModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    ticker: '',
    type: 'BUY',
    shares: '',
    price_usd: '',
    transaction_time: new Date().toISOString().slice(0, 16),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createTransaction({
        ...formData,
        shares: parseFloat(formData.shares),
        price_usd: parseFloat(formData.price_usd),
      });
      
      // 성공
      setFormData({
        ticker: '',
        type: 'BUY',
        shares: '',
        price_usd: '',
        transaction_time: new Date().toISOString().slice(0, 16),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || '거래 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">새 거래 입력</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 종목 티커 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              종목 티커 *
            </label>
            <input
              type="text"
              name="ticker"
              value={formData.ticker}
              onChange={handleChange}
              placeholder="VOO"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>

          {/* 매수/매도 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              매수/매도 *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="BUY"
                  checked={formData.type === 'BUY'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span>매수</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="SELL"
                  checked={formData.type === 'SELL'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span>매도</span>
              </label>
            </div>
          </div>

          {/* 수량 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              수량 *
            </label>
            <input
              type="number"
              name="shares"
              value={formData.shares}
              onChange={handleChange}
              placeholder="10"
              step="0.0001"
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 매수 단가 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              매수 단가 (USD) *
            </label>
            <input
              type="number"
              name="price_usd"
              value={formData.price_usd}
              onChange={handleChange}
              placeholder="445.30"
              step="0.01"
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 거래 일시 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              거래 일시 *
            </label>
            <input
              type="datetime-local"
              name="transaction_time"
              value={formData.transaction_time}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              💡 저장 시 자동으로 당시 환율이 조회되어 기록됩니다.
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
