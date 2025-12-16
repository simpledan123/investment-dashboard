# Investment Portfolio API

미국 주식/ETF 포트폴리오 관리 시스템 백엔드

## 🏗️ 프로젝트 구조

```
backend/
├── main.py                    # FastAPI 진입점
├── database.py               # DB 연결 설정
├── init_db.py               # DB 초기화 스크립트
├── requirements.txt          # Python 의존성
├── .env.example             # 환경변수 예시
│
├── models/                   # SQLAlchemy 모델
│   ├── holdings.py          # 보유 종목
│   ├── transaction.py       # 거래 내역
│   └── alert.py            # 알림 기록
│
├── schemas/                  # Pydantic 스키마
│   ├── common.py            # 공통 스키마
│   ├── holdings.py
│   ├── transaction.py
│   ├── portfolio.py
│   └── alert.py
│
├── crud/                     # 데이터 접근 레이어
│   ├── holdings.py
│   ├── transaction.py
│   ├── portfolio.py
│   └── alert.py
│
├── api/                      # API 라우터
│   ├── deps.py              # 공통 의존성
│   └── v1/
│       ├── endpoints/
│       │   ├── holdings.py
│       │   ├── transactions.py
│       │   ├── portfolio.py
│       │   ├── exchange.py
│       │   └── alerts.py
│       └── router.py
│
├── services/                 # 비즈니스 로직
│   ├── stock_service.py     # 주가 조회 (yfinance)
│   ├── forex_service.py     # 환율 조회
│   ├── email_service.py     # 이메일 알림
│   └── scheduler.py         # 가격 알림 스케줄러
│
├── core/                     # 핵심 설정
│   └── config.py            # 설정 관리
│
└── utils/                    # 유틸리티
    └── (추후 추가)
```

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# Python 가상환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정
cp .env.example .env
# .env 파일 편집하여 실제 값 입력
```

### 2. 데이터베이스 초기화

```bash
# PostgreSQL 데이터베이스 생성
createdb investment_db

# 테이블 생성 및 테스트 데이터 추가
python init_db.py
```

### 3. 서버 실행

```bash
# 개발 모드 (자동 재시작)
python main.py

# 또는 uvicorn 직접 실행
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

서버 실행 후 접속:
- API 문서: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

## 📡 API 엔드포인트

### 보유 종목 (Holdings)
- `GET /api/v1/holdings` - 보유 종목 목록
- `GET /api/v1/holdings/{ticker}` - 종목 상세 정보
- `DELETE /api/v1/holdings/{ticker}` - 종목 삭제

### 거래 (Transactions)
- `POST /api/v1/transactions` - 거래 입력
- `GET /api/v1/transactions` - 거래 내역 조회
- `DELETE /api/v1/transactions/{id}` - 거래 삭제

### 포트폴리오 (Portfolio)
- `GET /api/v1/portfolio/summary` - 포트폴리오 요약

### 환율 (Exchange Rate)
- `GET /api/v1/exchange-rate` - USD/KRW 환율 조회

### 알림 (Alerts)
- `GET /api/v1/alerts` - 알림 내역 조회

## 🔧 주요 기능

### 1. 실시간 주가 조회
- yfinance를 통한 미국 주식/ETF 실시간 가격 조회

### 2. 환율 자동 변환
- 5분 캐싱으로 API 호출 최소화
- 실패시 캐시된 값 사용으로 안정성 보장

### 3. 가격 변동 알림
- 미국 증시 시간에만 작동
- 5% 이상 변동시 이메일 알림
- 중복 알림 방지 (1시간 쿨다운)

### 4. 포트폴리오 분석
- 평균 매수가 자동 계산
- 실시간 수익률 계산
- 종목별/전체 손익 분석

## ⚙️ 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 | - |
| `SMTP_USER` | Gmail 계정 | - |
| `SMTP_PASSWORD` | Gmail 앱 비밀번호 | - |
| `ALERT_EMAIL` | 알림 수신 이메일 | - |
| `PRICE_ALERT_THRESHOLD` | 알림 임계값 (%) | 5.0 |
| `ALERT_CHECK_INTERVAL` | 체크 간격 (분) | 10 |
| `FRONTEND_URL` | 프론트엔드 URL | http://localhost:5173 |

## 📦 주요 의존성

- **FastAPI**: 고성능 웹 프레임워크
- **SQLAlchemy**: ORM
- **Pydantic**: 데이터 검증
- **yfinance**: 주가 정보 조회
- **APScheduler**: 스케줄러
- **psycopg2**: PostgreSQL 드라이버

## 🎯 개발 가이드

### 새 API 엔드포인트 추가

1. `schemas/`에 Pydantic 모델 추가
2. `crud/`에 데이터베이스 로직 추가
3. `api/v1/endpoints/`에 라우터 추가
4. `api/v1/router.py`에 라우터 등록

### 데이터베이스 마이그레이션

```bash
# Alembic 초기화 (처음만)
alembic init alembic

# 마이그레이션 생성
alembic revision --autogenerate -m "migration message"

# 마이그레이션 적용
alembic upgrade head
```

## 📝 라이선스

MIT License
