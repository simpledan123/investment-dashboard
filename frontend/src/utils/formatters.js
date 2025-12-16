// 숫자 포맷팅

export const formatKRW = (value) => {
  if (value === null || value === undefined) return '-';
  return `₩${Math.round(value).toLocaleString('ko-KR')}`;
};

export const formatUSD = (value) => {
  if (value === null || value === undefined) return '-';
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatPercent = (value) => {
  if (value === null || value === undefined) return '-';
  const formatted = Number(value).toFixed(2);
  return value >= 0 ? `+${formatted}%` : `${formatted}%`;
};

export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-';
  return Number(value).toLocaleString('en-US', { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
};

// 날짜 포맷팅

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR');
};

// 색상 유틸리티

export const getProfitColor = (value) => {
  if (value === null || value === undefined) return 'text-gray-500';
  return value >= 0 ? 'text-blue-600' : 'text-red-600';
};

export const getProfitBgColor = (value) => {
  if (value === null || value === undefined) return 'bg-gray-100';
  return value >= 0 ? 'bg-blue-50' : 'bg-red-50';
};
