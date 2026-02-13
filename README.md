# 📊 Investment Portfolio Dashboard

미국 ETF/주식 포트폴리오 관리 시스템

## 🎯 주요 기능

- ✅ 실시간 USD/KRW 환율 표시 (5분 캐싱)
- ✅ 보유 종목 및 평가액 관리
- ✅ 거래 내역 기록 (매수/매도)
- ✅ 수익률 자동 계산
- ✅ 5% 이상 가격 변동 시 자동 알림
- ✅ 미국 증시 거래 시간만 모니터링 (리소스 최적화)
- ✅ Docker Compose로 원클릭 배포

## 🏗️ 기술 스택

### Backend
- **NestJS** (TypeScript)
- **PostgreSQL** + TypeORM
- **Swagger** (API 문서 자동 생성)
- **Yahoo Finance API** (주가 조회)
- **@nestjs/schedule** (가격 모니터링)

### Frontend
- **React 19** + Vite
- **TailwindCSS 4**
- **Axios**

### DevOps
- **Docker** + Docker Compose
- **Nginx** (Frontend 서빙)

## 🚀 빠른 시작 (Docker)

### 사전 요구사항
- Docker Desktop 설치

### 실행 방법
```bash
# 1. 프로젝트 클론
git clone <repository-url>
cd investment-dashboard

# 2. Docker 실행 (첫 빌드는 5-10분 소요)
docker-compose up -d --build

# 3. 접속
# Frontend: http://localhost
# Backend API: http://localhost:8000
# Swagger Docs: http://localhost:8000/docs
```

### 중지 및 재시작
```bash
# 중지
docker-compose stop

# 재시작
docker-compose start

# 삭제 (데이터 보존)
docker-compose down

# 삭제 (데이터 포함)
docker-compose down -v
```

## 🛠️ 로컬 개발 (Docker 없이)

### 1. PostgreSQL 설치 및 DB 생성
```bash
createdb investment_db
```

### 2. Backend 설정
```bash
cd backend

# 패키지 설치
npm install

# 환경 변수 설정 (.env)
NODE_ENV=development
PORT=8000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=investment_db
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest/USD
PRICE_ALERT_THRESHOLD=5.0

# 개발 서버 실행
npm run start:dev
```

API 문서: http://localhost:8000/docs

### 3. Frontend 설정
```bash
cd frontend

# 패키지 설치
npm install

# 환경 변수 설정 (.env)
VITE_API_URL=http://localhost:8000

# 개발 서버 실행
npm run dev
```

브라우저: http://localhost:5173

## 📦 프로젝트 구조
```
investment-dashboard/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── common/            # 공통 서비스 (Stock, Forex, Scheduler)
│   │   ├── holdings/          # 보유 종목 모듈
│   │   ├── transactions/      # 거래 내역 모듈
│   │   ├── portfolio/         # 포트폴리오 요약 모듈
│   │   ├── exchange-rate/     # 환율 모듈
│   │   └── alerts/            # 알림 모듈
│   ├── Dockerfile
│   └── package.json
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── api/               # API 클라이언트
│   │   ├── components/        # React 컴포넌트
│   │   └── utils/             # 유틸리티 함수
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🔧 주요 API 엔드포인트

### 환율
```
GET  /api/v1/exchange-rate      # 현재 USD/KRW 환율
```

### 보유 종목
```
GET  /api/v1/holdings            # 보유 종목 목록 (현재가 포함)
GET  /api/v1/holdings/:ticker    # 종목 상세 정보
POST /api/v1/holdings            # 종목 추가
DELETE /api/v1/holdings/:ticker  # 종목 삭제
```

### 거래
```
GET  /api/v1/transactions        # 거래 내역 조회
POST /api/v1/transactions        # 거래 입력 (매수/매도)
GET  /api/v1/transactions/:id    # 거래 상세
DELETE /api/v1/transactions/:id  # 거래 삭제
```

### 포트폴리오
```
GET  /api/v1/portfolio/summary   # 포트폴리오 요약 (총 평가액, 수익률)
```

### 알림
```
GET  /api/v1/alerts              # 알림 내역 조회
```

## 📊 데이터베이스 스키마

### holdings (보유 종목)
- `id` (SERIAL PRIMARY KEY)
- `ticker` (VARCHAR(10) UNIQUE) - 종목 티커
- `name` (VARCHAR(100)) - 종목명
- `created_at` (TIMESTAMP)

### transactions (거래 내역)
- `id` (SERIAL PRIMARY KEY)
- `ticker` (VARCHAR(10) FK → holdings.ticker)
- `type` (VARCHAR(4)) - BUY/SELL
- `shares` (NUMERIC(10,4)) - 수량
- `price_usd` (NUMERIC(10,2)) - 단가 (USD)
- `exchange_rate` (NUMERIC(10,2)) - 환율
- `transaction_time` (TIMESTAMP) - 거래 일시
- `created_at` (TIMESTAMP)

### alerts (알림 기록)
- `id` (SERIAL PRIMARY KEY)
- `ticker` (VARCHAR(10)) - 종목 티커
- `change_percent` (NUMERIC(5,2)) - 변동률 (%)
- `price` (NUMERIC(10,2)) - 가격 (USD)
- `sent_at` (TIMESTAMP) - 발송 시간

## 🎨 UI 구성

### 메인 대시보드
- 💵 환율 정보 카드
- 📈 포트폴리오 요약 (총 평가액, 수익률, 보유 종목 수)
- 🏦 보유 종목 테이블 (현재가, 수익률, 일일 변동률)
- 🔔 최근 알림 리스트

### 종목 상세 화면
- 현재가 및 일일 변동률
- 보유 현황 (수량, 평균 매수가, 평가액, 수익률)
- 📝 거래 내역 테이블
- 💰 손익 계산 (투입금액, 평가액, 미실현 손익)

### 거래 입력 모달
- 종목 티커 입력
- 매수/매도 선택
- 수량, 단가, 거래 일시 입력
- 자동 환율 조회 및 저장

## ⚙️ 스케줄러 설정

### 가격 모니터링
- **주기**: 미국 정규 거래 시간 중 10분마다
- **시간**: 한국 시간 22:30 ~ 06:00 (월~금)
- **장 마감 체크**: 06:05 (최종 확인)

### 알림 조건
- 전일 대비 5% 이상 변동
- 중복 알림 방지 (1시간 쿨다운)

## 🚨 트러블슈팅

### 1. Docker 포트 충돌
```bash
# 80, 8000, 5432 포트가 이미 사용 중인 경우
# docker-compose.yml에서 포트 변경:
ports:
  - "8001:8000"  # Backend
  - "81:80"      # Frontend
```

### 2. DB 연결 실패
```bash
# PostgreSQL 컨테이너 재시작
docker-compose restart postgres

# 로그 확인
docker-compose logs postgres
```

### 3. 환율 API 제한
- exchangerate-api.com 무료 티어: 월 1,500회
- 캐싱으로 API 호출 최소화 (5분마다 갱신)

### 4. 주가 조회 실패
- Yahoo Finance API는 간헐적 오류 가능
- 재시도 로직 구현됨
- 대안: Alpha Vantage API


## DB 성능 최적화 (N+1 제거)

### 문제
기존 구현은 holdings를 조회한 뒤, 각 holding마다 transactions를 조회하여
holding 개수(N)에 비례해 DB 쿼리 수가 증가하는 N+1 문제가 있었습니다.

### 개선
transactions 테이블을 ticker 기준으로 GROUP BY하여 아래를 한 번에 집계합니다.

- net_shares = SUM(BUY shares) - SUM(SELL shares)
- cost_krw = SUM(BUY shares * priceUsd * exchangeRate)

서비스 레벨에서는 ticker별 현재가(Yahoo Finance) 조회만 수행합니다.