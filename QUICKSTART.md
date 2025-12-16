# 🚀 빠른 시작 가이드

## ✅ 시작 전 체크리스트

### 필수 준비 사항
- [ ] PostgreSQL 설치 및 실행 중
- [ ] Python 3.8+ 설치
- [ ] Node.js 16+ 및 npm 설치
- [ ] Gmail 계정 (알림용)

---

## 📝 Step-by-Step 실행 가이드

### 1️⃣ 데이터베이스 생성

```bash
# PostgreSQL 데이터베이스 생성
createdb investment_db

# 또는 psql에서
psql -U postgres
CREATE DATABASE investment_db;
\q
```

### 2️⃣ Backend 설정 및 실행

```bash
cd backend

# Python 패키지 설치
pip install -r requirements.txt

# 환경 변수 설정
cp .env.example .env
nano .env  # 또는 vi, code 등으로 편집
```

**`.env` 파일 필수 설정:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/investment_db
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password-here
ALERT_EMAIL=형님-email@gmail.com
FRONTEND_URL=http://localhost:5173
```

**Gmail 앱 비밀번호 발급:**
1. https://myaccount.google.com/security
2. 2단계 인증 활성화
3. "앱 비밀번호" 생성
4. 생성된 16자리를 SMTP_PASSWORD에 입력

```bash
# 데이터베이스 초기화 (선택: 테스트 데이터 포함)
python init_db.py

# 백엔드 서버 실행
python main.py
# 또는
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ 백엔드 동작 확인: http://localhost:8000/docs

### 3️⃣ Frontend 설정 및 실행

**새 터미널 열기**

```bash
cd frontend

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

✅ 프론트엔드 접속: http://localhost:5173

---

## 🎯 첫 거래 입력 테스트

1. 브라우저에서 http://localhost:5173 접속
2. **[+ 거래 입력]** 버튼 클릭
3. 예시 데이터 입력:
   - 종목 티커: `VOO`
   - 매수/매도: 매수
   - 수량: `10`
   - 단가: `445.30`
   - 거래 일시: 현재 시간
4. **[저장]** 클릭
5. 메인 화면에서 VOO 종목 확인
6. VOO 클릭 → 상세 화면에서 거래 내역 확인

---

## 🔍 트러블슈팅

### Backend 오류

**오류: `ModuleNotFoundError: No module named 'XXX'`**
```bash
cd backend
pip install -r requirements.txt --upgrade
```

**오류: `psycopg2.OperationalError: could not connect to server`**
- PostgreSQL 실행 여부 확인: `pg_isready`
- DATABASE_URL 확인 (포트 번호, 사용자명, 비밀번호)

**오류: `yfinance` 주가 조회 실패**
- 인터넷 연결 확인
- 티커 심볼이 정확한지 확인 (대문자, 미국 주식)

### Frontend 오류

**오류: `Failed to fetch`**
- Backend가 실행 중인지 확인 (http://localhost:8000/docs)
- CORS 설정 확인 (backend/main.py)
- `.env` 파일에 `VITE_API_URL=http://localhost:8000` 확인

**오류: Tailwind CSS 스타일 미적용**
```bash
cd frontend
npm run build  # 빌드 테스트
npm run dev    # 재실행
```

### 이메일 알림 오류

**오류: `SMTPAuthenticationError`**
- Gmail 앱 비밀번호 재생성
- 2단계 인증 활성화 확인
- SMTP_USER, SMTP_PASSWORD 정확성 확인

**알림이 안 와요**
- 미국 증시 거래 시간인지 확인 (한국시간 22:30~06:00)
- Backend 로그 확인: "📴 미국 증시 휴장 중" 메시지 체크
- 5% 이상 변동 종목이 있는지 확인

---

## 🌐 배포 (선택 사항)

### Render.com 무료 배포

**1. Backend + Database**
1. https://render.com 가입
2. New PostgreSQL 생성 (Free 플랜)
3. New Web Service 생성
   - GitHub repo 연결
   - Build: `pip install -r backend/requirements.txt`
   - Start: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
4. 환경 변수 추가 (Render 대시보드)

**2. Frontend (Vercel)**
1. https://vercel.com 가입
2. Import Project → GitHub repo
3. Root Directory: `frontend`
4. Framework: Vite
5. 환경 변수: `VITE_API_URL=<Render Backend URL>`

---

## 📊 데이터베이스 직접 확인

```bash
# PostgreSQL 접속
psql -U postgres -d investment_db

# 테이블 확인
\dt

# 보유 종목 조회
SELECT * FROM holdings;

# 거래 내역 조회
SELECT * FROM transactions ORDER BY transaction_time DESC;

# 알림 내역 조회
SELECT * FROM alerts ORDER BY sent_at DESC LIMIT 10;
```

---

## 🎓 다음 단계

- [ ] 실제 거래 데이터 입력
- [ ] Gmail 알림 테스트
- [ ] 형님께 URL 전달
- [ ] 피드백 수집 및 개선

---

## 🆘 도움이 필요하면

1. Backend 로그 확인: 터미널에서 실행 중인 `python main.py` 출력
2. Frontend 콘솔 확인: 브라우저 개발자 도구 (F12) → Console 탭
3. Network 탭에서 API 요청 상태 확인

