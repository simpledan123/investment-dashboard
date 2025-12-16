import React, { useState, useEffect } from 'react';
import ExchangeRateCard from './ExchangeRateCard';
import PortfolioSummary from './PortfolioSummary';
import HoldingsTable from './HoldingsTable';
import AlertsList from './AlertsList';
import StockDetail from './StockDetail';
import TransactionModal from './TransactionModal';
import {
  getExchangeRate,
  getHoldings,
  getPortfolioSummary,
  getAlerts,
  getStockDetail,
} from '../api/client';

const Dashboard = () => {
  const [exchangeRate, setExchangeRate] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 데이터 로딩
  const fetchData = async () => {
    try {
      setLoading(true);
      const [rateData, holdingsData, summaryData, alertsData] = await Promise.all([
        getExchangeRate(),
        getHoldings(),
        getPortfolioSummary(),
        getAlerts(5),
      ]);

      setExchangeRate(rateData);
      setHoldings(holdingsData);
      setSummary(summaryData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // 30초마다 환율 업데이트
    const interval = setInterval(async () => {
      try {
        const rateData = await getExchangeRate();
        setExchangeRate(rateData);
      } catch (error) {
        console.error('환율 업데이트 실패:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // 종목 클릭 핸들러
  const handleStockClick = async (ticker) => {
    try {
      const stockData = await getStockDetail(ticker);
      setSelectedStock(stockData);
    } catch (error) {
      console.error('종목 상세 조회 실패:', error);
    }
  };

  // 거래 추가 성공 핸들러
  const handleTransactionSuccess = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 종목 상세 화면
  if (selectedStock) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StockDetail stock={selectedStock} onBack={() => setSelectedStock(null)} />
        </div>
      </div>
    );
  }

  // 메인 대시보드
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">📊 Investment Portfolio Dashboard</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            + 거래 입력
          </button>
        </div>

        {/* 환율 정보 */}
        {exchangeRate && (
          <ExchangeRateCard
            exchangeRate={exchangeRate.usd_to_krw}
            updatedAt={exchangeRate.updated_at}
          />
        )}

        {/* 포트폴리오 요약 */}
        <PortfolioSummary summary={summary} />

        {/* 보유 종목 테이블 */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🏦 보유 종목</h2>
          <HoldingsTable holdings={holdings} onStockClick={handleStockClick} />
        </div>

        {/* 알림 리스트 */}
        <AlertsList alerts={alerts} />

        {/* 거래 입력 모달 */}
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleTransactionSuccess}
        />
      </div>
    </div>
  );
};

export default Dashboard;
