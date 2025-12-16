import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== 환율 API ====================

export const getExchangeRate = async () => {
  const response = await apiClient.get('/api/exchange-rate');
  return response.data;
};

// ==================== 보유 종목 API ====================

export const getHoldings = async () => {
  const response = await apiClient.get('/api/holdings');
  return response.data;
};

export const getStockDetail = async (ticker) => {
  const response = await apiClient.get(`/api/holdings/${ticker}`);
  return response.data;
};

// ==================== 거래 API ====================

export const createTransaction = async (transactionData) => {
  const response = await apiClient.post('/api/transactions', transactionData);
  return response.data;
};

// ==================== 포트폴리오 API ====================

export const getPortfolioSummary = async () => {
  const response = await apiClient.get('/api/portfolio/summary');
  return response.data;
};

// ==================== 알림 API ====================

export const getAlerts = async (limit = 10) => {
  const response = await apiClient.get(`/api/alerts?limit=${limit}`);
  return response.data;
};

export default apiClient;
