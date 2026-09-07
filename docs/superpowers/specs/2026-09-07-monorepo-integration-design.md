# Atlex 모노레포 통합 설계

## 상태

2026-09-07 대화에서 승인됨.

## 배경

현재 Atlex는 비어 있는 통합 저장소 안에 프론트엔드와 백엔드 Git 저장소가 각각 중첩되어 있다.

- 프론트엔드: Next.js 16, 원본 저장소 `git@github.com:mokwon-atlex/frontend.git`
- 백엔드: Spring Boot 4, 원본 저장소 `git@github.com:mokwon-atlex/backend.git`
- 통합 저장소: `git@github.com:mokwon-atlex/atlex.git`

통합 저장소는 각 원본 저장소의 최신 `dev` 스냅샷을 기준으로 새 이력을 시작한다. 기존 커밋 이력은 모노레포로 가져오지 않으며, 원본 저장소에서 계속 조회할 수 있다.

선택한 원본 리비전은 다음과 같다.

- 프론트엔드 `dev`: `2177570`
- 백엔드 `dev`: `6027d98`

## 목표

- 프론트엔드와 백엔드 소스를 하나의 최상위 Git 저장소에서 관리한다.
- 기존 `frontend/`와 `backend/` 애플리케이션 경계를 유지한다.
- 변경된 애플리케이션에 해당하는 CI만 실행한다.
- 모노레포를 배포 소스로 사용하여 Vercel에서 프론트엔드를 배포한다.
- 모노레포를 기준으로 백엔드 이미지를 빌드하여 GHCR과 EC2로 배포한다.
- 별도의 크로스 플랫폼 작업 실행기를 추가하지 않고 macOS, Linux, Windows에서 개발 명령을 사용할 수 있게 한다.
- 비밀값, 의존성, IDE 파일, 빌드 결과물이 새 Git 이력에 포함되지 않게 한다.

## 범위에서 제외하는 항목

- 기존 프론트엔드·백엔드 저장소의 커밋 이력 가져오기
- Nx, Turborepo, Gradle composite build 등 별도의 모노레포 프레임워크 도입
- 프론트엔드와 백엔드 의존성 관리 통합
- 저장소 통합 과정에서 애플리케이션 동작 변경
- EC2 인스턴스가 꺼져 있는 동안 실제 EC2 배포 성공을 필수 완료 조건으로 삼는 것

## 저장소와 브랜치 구조

통합 후에는 최상위 `.git` 디렉터리 하나만 존재한다.

```text
atlex/
├── .git/
├── .github/workflows/
├── .gitignore
├── README.md
├── frontend/
│   ├── .gitignore
│   └── ...
└── backend/
    ├── .gitignore
    └── ...
```

루트 저장소가 애플리케이션 파일을 추적하기 전에 `frontend/.git`과 `backend/.git`을 임시 백업 위치로 이동한다. 루트 저장소의 통합 브랜치 이름은 `develop`이다.

브랜치별 역할은 다음과 같다.

- `develop`: 기능 PR을 통합하고 비운영 환경에서 검증하는 브랜치
- `main`: 운영 배포 브랜치. `develop`에서 `main`으로 PR을 병합하여 변경한다.
- 기능·수정 브랜치: `develop`에서 분기하고 다시 `develop`으로 PR을 생성한다.

기존 프론트엔드와 백엔드 GitHub 저장소는 이력 조회와 복구를 위해 그대로 남겨 둔다. 통합 이후에는 배포 소스로 사용하지 않는다.

## `.gitignore` 구성

무시 규칙은 계층형으로 유지한다.

- 루트 `.gitignore`: 운영체제, IDE, 비밀값, 임시 파일에 대한 공통 규칙
- `frontend/.gitignore`: Node.js, Next.js, 커버리지, Storybook, 프론트엔드 환경파일 규칙
- `backend/.gitignore`: Gradle, Java, IDE, 백엔드 환경파일, 로컬 전용 Docker override 규칙

최초 소스 커밋 전에 스테이징된 전체 파일 목록을 확인한다. 최소한 다음 항목은 스테이징되면 안 된다.

- `.env` 등 예제 파일이 아닌 환경파일
- `.idea/`, `.vscode/`, `.DS_Store`
- `node_modules/`, `.next/`, `coverage/`, `storybook-static/`
- `.gradle/`, `build/`, `out/`
- `backend/docker-compose.override.yml`

기존 `.env.example` 파일은 계속 추적한다. 비밀값은 루트 문서나 워크플로에 복사하지 않는다.

## 로컬 개발과 검증

루트 Makefile이나 새로운 실행 의존성은 추가하지 않는다. 각 애플리케이션은 기존 표준 명령을 그대로 사용한다.

프론트엔드 명령은 `frontend/`에서 실행한다.

- 설치: `npm ci`
- 개발 실행: `npm run dev`
- 테스트: `npm run test`
- 빌드: `npm run build`

프론트엔드에는 이미 설치된 Vitest를 사용하는 비대화형 `test` 스크립트를 추가한다. 아직 테스트 파일이 없더라도 명령이 성공하도록 구성하여 첫 테스트가 추가되기 전부터 CI가 동일한 명령을 실행할 수 있게 한다.

백엔드 명령은 `backend/`에서 실행한다.

- macOS/Linux 개발 실행: `./gradlew bootRun`
- Windows 개발 실행: `.\gradlew.bat bootRun`
- macOS/Linux 테스트: `./gradlew test`
- Windows 테스트: `.\gradlew.bat test`
- 운영용 산출물 생성: `./gradlew bootJar`

루트 README에는 운영체제별 명령과 프론트엔드가 `BACKEND_ORIGIN`, `BASE_API_URL`을 통해 백엔드에 연결되는 방식을 기록한다.

## 지속적 통합(CI)

GitHub는 모노레포의 `frontend/.github/`나 `backend/.github/` 안에 있는 워크플로를 인식하지 않으므로, 모든 워크플로를 루트 `.github/workflows/`로 옮긴다.

### 프론트엔드 CI

`frontend/**` 또는 프론트엔드 CI 워크플로 자체가 변경된 `develop`, `main` 브랜치 push와 PR에서 실행한다.

1. 저장소를 checkout한다.
2. Node.js 22를 설치하고 `frontend/package-lock.json`을 기준으로 npm 캐시를 적용한다.
3. `frontend/`에서 `npm ci`를 실행한다.
4. 프론트엔드 테스트 명령을 실행한다.
5. `BACKEND_ORIGIN=http://127.0.0.1:8080`, `BASE_API_URL=http://127.0.0.1:8080/api/v1`을 사용하여 운영 빌드를 실행한다. 이 값은 비밀값이 아닌 빌드용 자리값이며 실제 백엔드를 시작하거나 호출하지 않는다.

### 백엔드 CI

`backend/**` 또는 백엔드 CI 워크플로 자체가 변경된 `develop`, `main` 브랜치 push와 PR에서 실행한다.

1. 저장소를 checkout한다.
2. Java 17을 설치하고 Gradle 의존성 캐시를 적용한다.
3. 백엔드 작업 디렉터리에서 `backend/gradlew test`를 실행한다.
4. `backend/gradlew bootJar`를 실행한다.

### 저장소 공통 자동화

- 중복된 AutoLabel 워크플로를 루트 워크플로 하나로 통합한다.
- 기능·수정 브랜치의 PR은 필요할 때 사용자가 직접 생성한다.
- OpenAPI 문서는 Springdoc이 애플리케이션 실행 중 제공하는 `/v3/api-docs`와 Swagger UI를 사용하며, 생성 JSON은 저장소에 추적하지 않는다.

## 배포

### Vercel 프론트엔드 배포

Vercel은 `mokwon-atlex/atlex` 저장소에 직접 연결한다.

- Root Directory: `frontend`
- Production Branch: `main`
- `develop`과 PR: Preview 배포
- 필수 환경변수: `BACKEND_ORIGIN`, `BASE_API_URL`. Vercel의 Production과 Preview 환경에 각각 설정한다.

기존 프론트엔드 포크 저장소는 더 이상 배포 소스로 사용하지 않는다. 저장소 연결과 환경변수 이전은 이 작업공간의 파일로 표현할 수 없는 외부 설정이므로 수동으로 수행한다.

### GHCR·EC2 백엔드 배포

`main`에 push될 때 `backend/**` 또는 배포 워크플로가 변경된 경우 백엔드 배포를 실행하며, 수동 실행도 지원한다.

- Docker build context: `backend/`
- GHCR 이미지: 기존 `ghcr.io/mokwon-atlex/atlex` 유지
- EC2 checkout 대상: 새 `mokwon-atlex/atlex` 저장소의 `main`
- Compose 실행: `backend/docker-compose.yml`을 명시적으로 사용
- 기존 EC2·레지스트리 secret: 배포 활성화 전에 새 GitHub 저장소로 이전

현재 EC2 인스턴스는 꺼져 있다. 이 때문에 SSH 접속이나 원격 재시작 단계가 실패하더라도 이번 통합의 완료 조건을 실패한 것으로 판단하지 않는다. 다만 워크플로 정의, Docker 이미지 빌드, Compose 설정은 검증해야 한다. 최종 보고에서는 실제 배포를 건너뛰었거나 오프라인으로 실패한 상태를 배포 성공과 명확히 구분한다.

## 마이그레이션 순서와 커밋 경계

변경은 관심사별로 분리한다.

1. `docs:` 승인된 설계 문서를 커밋한다.
2. 두 원본 작업 트리를 확인하고 통합 전 빌드와 테스트를 실행한다.
3. 중첩된 Git 메타데이터를 임시 복구 디렉터리로 이동하고, ignore 규칙을 설정한 뒤 프론트엔드와 백엔드 소스 스냅샷을 `refactor:` 커밋으로 기록한다.
4. 소스 관리되는 테스트 설정을 추가하거나 수정하면 별도의 `test:` 커밋으로 기록한다.
5. GitHub Actions 이전과 수정은 별도의 `ci:` 커밋으로 기록한다.
6. 루트 사용 문서는 별도의 `docs:` 커밋으로 기록한다.
7. 통합 후 검증을 실행하고 최종 추적 파일 목록을 확인한다.
8. 로컬 검증 후 외부 쓰기에 대한 명시적인 확인을 받고 `develop`을 push한다.
9. 승인한 브랜치 흐름에 맞춰 `main`을 생성하거나 채운다. EC2가 오프라인이어서 발생하는 배포 실패는 방해 요인으로 취급하지 않는다.

관련 없는 애플리케이션 리팩터링은 포함하지 않는다.

## 실패 처리와 복구

- 마이그레이션 전에 원본 작업 트리 중 하나라도 깨끗하지 않으면 `.git` 이동 전에 중단한다.
- 통합 전 빌드나 테스트가 실패하면 기존 실패인지 기록하고, 깨끗한 기준점이라고 주장하지 않는다.
- 루트 index에 무시 대상이나 민감 파일이 나타나면 커밋 전에 스테이징에서 제외하고 ignore 규칙을 수정한다.
- 루트 저장소의 검증된 커밋이 만들어질 때까지 이동한 내부 Git 메타데이터를 보관한다. 그 전에 마이그레이션이 실패하면 원래 위치로 복구할 수 있다.
- merge conflict를 자동으로 해결하거나 원격 이력을 강제로 다시 쓰지 않는다.
- EC2가 꺼져 있어서 발생한 접속 실패는 보고하되 이번 마이그레이션에서만 무시한다.

## 완료 기준

- 루트 `.git` 하나만 프론트엔드와 백엔드 파일을 관리한다.
- 루트 Git이 승인된 `dev` 리비전의 두 애플리케이션을 추적한다.
- 민감 파일, 의존성 디렉터리, 빌드 결과물, 로컬 전용 파일이 추적되지 않고 ignore된다.
- 프론트엔드 테스트와 운영 빌드가 로컬에서 성공한다. 기존 실패가 있으면 계속 진행하기 전에 사용자에게 명시적인 승인을 받는다.
- 백엔드 테스트와 `bootJar`가 로컬에서 성공한다. 기존 실패가 있으면 계속 진행하기 전에 사용자에게 명시적인 승인을 받는다.
- 경로 필터가 적용된 프론트엔드·백엔드 CI가 올바른 모노레포 작업 디렉터리를 사용한다.
- Vercel에서 `frontend`를 Root Directory로, `main`을 Production Branch로 설정할 수 있다.
- `backend/`를 기준으로 백엔드 Docker 이미지를 빌드할 수 있고 Compose 경로가 모노레포 구조에서 정상적으로 해석된다.
- EC2가 오프라인인 동안 실제 배포 성공은 명시적으로 완료 조건에서 제외한다.
