# Atlex

Atlex 프론트엔드와 백엔드를 함께 관리하는 모노레포입니다.

개발과 코드 리뷰 규칙은 [Atlex 기여 가이드](CONTRIBUTING.md)를 따릅니다.

## 구조

- `frontend/`: Next.js 16
- `backend/`: Spring Boot 4, Java 17

## 루트 통합 검증

루트 디렉터리에서 다음 명령으로 포맷, 테스트와 빌드를 함께 검사합니다.

```bash
npm run check:frontend
npm run check:backend
npm run check
```

- `check:frontend`: 프론트엔드 Prettier 검사, 테스트와 빌드
- `check:backend`: 백엔드 Spotless 검사, 테스트와 `bootJar`
- `check`: 프론트엔드와 백엔드 검증을 순차 실행

백엔드 검증은 운영체제에 따라 `gradlew` 또는 `gradlew.bat`을 자동으로 사용합니다.

## 프론트엔드

`frontend/.env.example`을 참고해 `frontend/.env`를 만든 뒤 실행합니다.

`BACKEND_ORIGIN`에는 `/api/v1`을 제외한 백엔드 origin을, `BASE_API_URL`에는 `/api/v1`을 포함한 주소를 설정합니다.

```bash
cd frontend
npm ci
npx playwright install chromium
npm run dev
```

`npx playwright install chromium`은 Vitest 브라우저 테스트에 필요한 로컬 Chromium을 설치합니다. Linux CI에서는 `npx playwright install --with-deps chromium`을 사용합니다.

검증 명령은 `npm run test`, `npm run build`입니다.

## 백엔드

`backend/docker-compose.yml`은 같은 디렉터리의 `.env`에서 `DB_HOST`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`을 읽습니다. 실제 값을 저장소에 커밋하지 마세요.

macOS/Linux:

```bash
cd backend
cp .env.example .env
# .env에 DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD, JWT_SECRET 입력
./gradlew bootRun
```

Windows PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
# .env에 DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD, JWT_SECRET 입력
.\gradlew.bat bootRun
```

검증 명령은 `./gradlew test`와 `./gradlew bootJar`이며, Windows에서는 `gradlew.bat`을 사용합니다.

## 브랜치

- 기능·수정 브랜치는 `develop`에서 분기하고 `develop`으로 PR을 생성합니다.
- 운영 배포는 `develop`에서 `main`으로 PR을 병합하여 진행합니다.

## CI

- 프론트엔드와 백엔드 CI는 `develop`·`main` push 및 해당 브랜치 PR에서 항상 체크를 생성합니다. 각 영역의 포맷, 테스트와 빌드는 `frontend/**`, `backend/**` 또는 관련 workflow 파일이 변경된 경우에만 실행합니다.
- 프론트엔드 CI는 Node.js 22로 `npm ci`, `npm run format:check`, `npm run test`, `npm run build`를 실행하며, `BACKEND_ORIGIN=http://127.0.0.1:8080`, `BASE_API_URL=http://127.0.0.1:8080/api/v1`을 빌드용 값으로 사용합니다.
- 백엔드 CI는 Java 17로 `./gradlew spotlessCheck`, `./gradlew test`, `./gradlew bootJar`를 실행합니다.

## 배포 설정

- Vercel: 저장소 `mokwon-atlex/atlex`, Root Directory `frontend`, Production Branch `main`
- 백엔드: `main`의 `backend/**` 변경 시 GHCR 이미지 빌드 후 EC2 배포
- EC2가 오프라인이면 SSH 배포 단계가 실패할 수 있으며, 이미지 빌드 성공 여부와 구분해서 확인합니다.

Vercel의 Production·Preview 환경에는 실제 백엔드 주소에 맞는 `BACKEND_ORIGIN`과 `BASE_API_URL`을 각각 설정합니다. 값은 저장소에 커밋하지 말고 각 실행 환경에서 주입합니다.
