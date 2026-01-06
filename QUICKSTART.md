# 🚀 빠른 시작 가이드

## ✅ 시작 전 체크리스트

### 필수 준비 사항
- [ ] Docker Desktop 설치 및 실행 중

**그게 다야!** Docker가 모든 것을 처리합니다. 🐳

---

## 🐳 Docker로 실행 (추천)

### 1️⃣ Docker 실행
```bash
# 프로젝트 루트에서
cd investment-dashboard

# Docker Compose 실행 (첫 빌드는 5-10분 소요)
docker-compose up -d --build

# 로그 확인 (선택)
docker-compose logs -f
```

### 2️⃣ 접속
```
Frontend:      http://localhost
Backend API:   http://localhost:8000
Swagger Docs:  http://localhost:8000/docs
```

### 3️⃣ 중지 및 재시작
```bash
# 중지
docker-compose stop

# 재시작
docker-compose start

# 완전 삭제 (데이터 보존)
docker-compose down

# 완전 삭제 (데이터 포함)
docker-compose down -v
```

---

## 🎯 첫 거래 입력 테스트

1. 브라우저에서 **http://localhost** 접속
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

## 🛠️ 로컬 개발 (Docker 없이)

### 필수 준비 사항
- [ ] PostgreSQL 설치 및 실행 중
- [ ] Node.js 20+ 및 npm 설치

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

# 패키지 설치
npm install

# 환경 변수 설정
cp .env.example .env
```

**`.env` 파일 필수 설정:**
```env
NODE_ENV=development
PORT=8000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=investment_db
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest/USD
PRICE_ALERT_THRESHOLD=5.0
```
```bash
# 개발 서버 실행
npm run start:dev
```

✅ 백엔드 동작 확인: http://localhost:8000/docs

### 3️⃣ Frontend 설정 및 실행

**새 터미널 열기**
```bash
cd frontend

# 패키지 설치
npm install

# 환경 변수 설정 (.env)
echo VITE_API_URL=http://localhost:8000 > .env

# 개발 서버 실행
npm run dev
```

✅ 프론트엔드 접속: http://localhost:5173

---

## 🔍 트러블슈팅

### Docker 관련

**오류: `port is already allocated`**
```bash
# 포트 사용 중인 프로세스 확인
netstat -ano | findstr :80
netstat -ano | findstr :8000

# docker-compose.yml에서 포트 변경
ports:
  - "81:80"      # Frontend
  - "8001:8000"  # Backend
```

**오류: `container exited with code 1`**
```bash
# 로그 확인
docker-compose logs backend
docker-compose logs frontend

# 캐시 없이 재빌드
docker-compose build --no-cache
docker-compose up
```

**오류: Docker Desktop이 느려요**
```bash
# 사용하지 않는 이미지/컨테이너 삭제
docker system prune -a
```

### Backend 오류 (로컬 개발시)

**오류: `Cannot find module '@nestjs/XXX'`**
```bash
cd backend
npm install
npm run start:dev
```

**오류: `ECONNREFUSED 127.0.0.1:5432`**
- PostgreSQL 실행 확인: `pg_isready`
- DATABASE_HOST, PORT, USER, PASSWORD 확인

**오류: TypeORM connection failed**
- .env 파일 위치 확인 (backend/.env)
- DATABASE_NAME이 존재하는지 확인

### Frontend 오류 (로컬 개발시)

**오류: `Failed to fetch`**
- Backend 실행 확인 (http://localhost:8000/docs)
- CORS 설정 확인
- VITE_API_URL 확인

**오류: `Error: Cannot find module 'tailwindcss'`**
```bash
cd frontend
npm install @tailwindcss/postcss
npm run dev
```

### 알림 시스템

**알림이 안 와요**
- 미국 증시 거래 시간 확인 (한국시간 22:30~06:00, 월~금)
- Backend 로그: "미국 증시 휴장 중" 메시지 확인
- 5% 이상 변동 종목이 있는지 확인
- alerts 테이블 확인: `SELECT * FROM alerts ORDER BY sent_at DESC;`

---

## 📊 데이터베이스 직접 확인

### Docker 사용시
```bash
# PostgreSQL 컨테이너 접속
docker exec -it investment-db psql -U postgres -d investment_db

# 테이블 확인
\dt

# 보유 종목 조회
SELECT * FROM holdings;

# 거래 내역 조회
SELECT * FROM transactions ORDER BY transaction_time DESC;

# 알림 내역 조회
SELECT * FROM alerts ORDER BY sent_at DESC LIMIT 10;

# 나가기
\q
```

### 로컬 개발시
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
- [ ] 여러 종목 추가해보기
- [ ] 종목 상세 화면에서 손익 확인
- [ ] Swagger UI에서 API 직접 테스트
- [ ] 포트폴리오 요약 확인

---

## 🆘 도움이 필요하면

### Docker 사용시
```bash
# 전체 로그 확인
docker-compose logs

# 특정 서비스 로그
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# 실시간 로그
docker-compose logs -f backend
```

### 로컬 개발시

1. **Backend 로그**: 터미널에서 `npm run start:dev` 실행 중인 출력
2. **Frontend 콘솔**: 브라우저 F12 → Console 탭
3. **Network 탭**: F12 → Network 탭에서 API 요청 확인

---

## 💡 유용한 Docker 명령어
```bash
# 컨테이너 상태 확인
docker-compose ps

# 특정 서비스만 재시작
docker-compose restart backend
docker-compose restart frontend

# 컨테이너 내부 접속
docker exec -it investment-api sh
docker exec -it investment-frontend sh

# 볼륨 확인
docker volume ls

# 네트워크 확인
docker network ls
```

---

## 🎉 성공 확인

✅ Docker가 정상 실행되면:
- http://localhost 접속 → 대시보드 표시
- http://localhost:8000/docs → Swagger UI 표시
- 거래 입력 → 종목 목록에 표시
- 종목 클릭 → 상세 화면 표시