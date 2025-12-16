# 📊 Investment Portfolio Dashboard

미국 ETF/주식 포트폴리오 관리 시스템

## 🎯 주요 기능

- ✅ 실시간 USD/KRW 환율 표시
- ✅ 보유 종목 및 평가액 관리
- ✅ 거래 내역 기록 (매수/매도)
- ✅ 수익률 자동 계산
- ✅ 5% 이상 가격 변동 시 이메일 알림
- ✅ 미국 증시 거래 시간만 모니터링 (리소스 최적화)

## 🏗️ 기술 스택

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy
- yfinance (주가 조회)
- APScheduler (가격 모니터링)

### Frontend
- React + Vite
- TailwindCSS
- Axios

## 📦 설치 및 실행

### 1. PostgreSQL 데이터베이스 준비

```bash
# PostgreSQL 설치 (이미 설치되어 있다고 가정)
createdb investment_db
```

### 2. Backend 설정

```bash
cd backend

# Python 패키지 설치
pip install -r requirements.txt

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어서 다음 정보 입력:
# - DATABASE_URL: PostgreSQL 연결 정보
# - SMTP_USER: Gmail 계정
# - SMTP_PASSWORD: Gmail 앱 비밀번호
# - ALERT_EMAIL: 알림 받을 이메일
```

**Gmail 앱 비밀번호 생성 방법**:
1. Google 계정 → 보안
2. 2단계 인증 활성화
3. 앱 비밀번호 생성
4. 생성된 16자리 비밀번호를 SMTP_PASSWORD에 입력

```bash
# 데이터베이스 테이블 생성 및 서버 실행
python main.py
# 또는
uvicorn main:app --reload
```

API 문서: http://localhost:8000/docs

### 3. Frontend 설정

```bash
cd frontend

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:5173 접속

## 🚀 무료 배포 (Render.com)

### Backend + Database 배포

1. **Render.com 가입**: https://render.com
2. **New PostgreSQL 생성**:
   - Name: `investment-db`
   - Plan: Free
   - 생성 후 Internal Database URL 복사

3. **New Web Service 생성**:
   - Connect your GitHub repository
   - Name: `investment-api`
   - Environment: Python
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Plan: Free

4. **환경 변수 설정** (Render Dashboard에서):
   ```
   DATABASE_URL=<Internal Database URL>
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=<your-gmail>
   SMTP_PASSWORD=<app-password>
   ALERT_EMAIL=<형님-email>
   FRONTEND_URL=<나중에 입력>
   ```

### Frontend 배포 (Vercel)

1. **Vercel 가입**: https://vercel.com
2. **Import Project**:
   - GitHub repository 선택
   - Root Directory: `frontend`
   - Framework Preset: Vite
   
3. **환경 변수 설정**:
   ```
   VITE_API_URL=<Render Backend URL>
   ```

4. **배포 완료 후**:
   - Render의 Backend 환경 변수에서 `FRONTEND_URL`을 Vercel URL로 업데이트

## 📱 사용 방법

### 1. 거래 입력
- 메인 화면에서 **[+ 거래 입력]** 버튼 클릭
- 종목 티커, 수량, 단가, 거래 시간 입력
- 저장 시 자동으로 당시 환율이 조회되어 기록됨

### 2. 종목 상세 보기
- 보유 종목 테이블에서 종목 클릭
- 거래 내역 및 손익 계산 확인

### 3. 가격 알림
- 5% 이상 변동 발생 시 자동으로 이메일 발송
- 미국 정규 거래 시간(한국시간 22:30~06:00)에만 체크
- 10분 간격 모니터링 + 장 마감 후 최종 체크

## 🔧 주요 API 엔드포인트

```
GET  /api/exchange-rate          # 현재 환율
GET  /api/holdings                # 보유 종목 목록
GET  /api/holdings/{ticker}       # 종목 상세
POST /api/transactions            # 거래 입력
GET  /api/portfolio/summary       # 포트폴리오 요약
GET  /api/alerts                  # 알림 내역
```

## 📊 데이터베이스 스키마

### holdings (보유 종목)
- ticker (PK, 종목 티커)
- name (종목명)

### transactions (거래 내역)
- ticker (FK)
- type (BUY/SELL)
- shares (수량)
- price_usd (단가)
- exchange_rate (환율)
- transaction_time (거래 시간)

### alerts (알림 기록)
- ticker
- change_percent (변동률)
- price (가격)
- sent_at (발송 시간)

## 🎨 UI 구성

### 메인 대시보드
- 환율 정보 카드
- 포트폴리오 요약 (총 평가액, 수익률)
- 보유 종목 테이블
- 최근 알림 리스트

### 종목 상세 화면
- 현재가 및 일일 변동률
- 보유 현황 (수량, 평균가, 수익률)
- 거래 내역 테이블
- 손익 계산

## 🚨 트러블슈팅

### 1. 환율 API 오류
- exchangerate-api.com의 무료 티어는 월 1,500회 제한
- 대안: openexchangerates.org (무료 1,000회/월)

### 2. 주가 조회 실패
- yfinance는 Yahoo Finance 크롤링 방식
- 간헐적 오류 발생 가능 → 재시도 로직 추가 권장

### 3. 이메일 발송 실패
- Gmail 보안 설정 확인
- 앱 비밀번호 재생성
- SMTP 포트(465) 차단 여부 확인

### 4. Render 슬립 모드
- 무료 플랜은 15분 미사용시 슬립
- 첫 접속 시 30초 대기 필요
- Railway($5/월) 또는 Fly.io 추천

## 📝 개발 로드맵

- [x] Phase 1: Backend API 구축
- [x] Phase 2: Frontend UI 구축
- [x] Phase 3: 가격 알림 시스템
- [ ] Phase 4: 차트 시각화 (Chart.js)
- [ ] Phase 5: 다중 사용자 지원
- [ ] Phase 6: 모바일 앱 (React Native)

## 📄 라이선스

MIT License

## 👨‍💻 개발자

형님의 명령으로 탄생한 프로젝트입니다. 🫡
