# Atlex 모노레포 통합 구현 계획

> **에이전트 작업자용:** REQUIRED SUB-SKILL: 이 계획을 작업별로 구현할 때 `superpowers:subagent-driven-development`(권장) 또는 `superpowers:executing-plans`를 사용한다. 진행 상황은 체크박스(`- [ ]`)로 추적한다.

**Goal(목표):** 최신 프론트엔드·백엔드 `dev` 스냅샷을 하나의 Atlex 저장소로 통합하고, 경로 기반 CI와 Vercel·GHCR·EC2 배포 구성을 모노레포에 맞춘다.

**Architecture(아키텍처):** 최상위 `.git` 하나가 `frontend/`와 `backend/`를 관리하되 두 애플리케이션의 빌드 도구와 환경파일은 분리해서 유지한다. GitHub Actions는 루트에서 경로 필터로 실행하고, Vercel은 `frontend/`, Docker는 `backend/`를 각 빌드 루트로 사용한다.

**Tech Stack(기술 스택):** Git, GitHub Actions, Next.js 16, Node.js 22, npm, Vitest, Java 17, Gradle Wrapper, Spring Boot 4, Docker Compose, GHCR, Vercel, EC2

**Spec(설계 문서):** `docs/superpowers/specs/2026-09-07-monorepo-integration-design.md`

## Global Constraints(전체 제약)

- 프론트엔드 기준 리비전은 `dev`의 `2177570`, 백엔드 기준 리비전은 `dev`의 `6027d98`이다.
- 기존 두 저장소의 커밋 이력은 가져오지 않고 원본 GitHub 저장소에 보존한다.
- Nx, Turborepo, Makefile 또는 새로운 루트 작업 실행기를 추가하지 않는다.
- 실제 `.env`, IDE 파일, 의존성 디렉터리, 빌드 결과물, `backend/docker-compose.override.yml`을 추적하지 않는다.
- 애플리케이션 동작이나 소스 구조를 리팩터링하지 않는다.
- `develop`은 통합 브랜치, `main`은 운영 배포 브랜치로 사용한다.
- EC2 오프라인으로 인한 SSH·재기동 실패는 이번 작업의 실패로 보지 않지만, 배포 성공으로 보고해서도 안 된다.
- 원격 push와 `main` 생성은 로컬 검증 완료 후 사용자의 명시적 확인을 받고 수행한다.

---

### Task 1: 통합 전 기준점 검증과 Git 메타데이터 백업

**Files:**
- Modify: `.gitignore`
- Track: `frontend/**`
- Track: `backend/**`
- Preserve: `docs/superpowers/specs/2026-09-07-monorepo-integration-design.md`
- Preserve: `docs/superpowers/plans/2026-09-07-monorepo-integration.md`

**Interfaces:**
- Consumes: 깨끗한 프론트엔드 `dev@2177570`, 백엔드 `dev@6027d98`
- Produces: 중첩 `.git`이 제거되고 루트 Git이 두 소스 스냅샷을 추적하는 `develop` 브랜치

- [ ] **Step 1: 원본 저장소 상태와 리비전을 다시 확인한다**

Run:

```bash
git -C frontend status --short --branch
git -C frontend rev-parse --short HEAD
git -C backend status --short --branch
git -C backend rev-parse --short HEAD
```

Expected: 두 상태에 변경 파일이 없고 브랜치는 모두 `dev`, 해시는 각각 `2177570`, `6027d98`이다. 다르면 `.git`을 이동하지 않고 중단한다.

- [ ] **Step 2: 통합 전 프론트엔드 기준 검증을 실행한다**

Run from repository root:

```bash
cd frontend
npm exec -- playwright install chromium
npm exec -- vitest run --passWithNoTests
BACKEND_ORIGIN=http://127.0.0.1:8080 BASE_API_URL=http://127.0.0.1:8080/api/v1 npm run build
```

Expected: Vitest와 Next.js 빌드가 exit code 0으로 끝난다. 실패하면 원본 저장소 상태에서 재현된 로그를 보존하고 사용자 승인 없이 통합을 진행하지 않는다.

- [ ] **Step 3: 통합 전 백엔드 기준 검증을 실행한다**

Run from repository root:

```bash
cd backend
./gradlew test
./gradlew bootJar
```

Expected: 두 Gradle 명령이 `BUILD SUCCESSFUL`로 끝난다. 실패하면 원본 저장소 상태에서 재현된 로그를 보존하고 사용자 승인 없이 통합을 진행하지 않는다.

- [ ] **Step 4: 내부 Git 메타데이터를 복구 가능한 위치로 이동한다**

Run from repository root:

```bash
test -d frontend/.git
test -d backend/.git
test ! -e /private/tmp/atlex-git-backup-20260907
mkdir /private/tmp/atlex-git-backup-20260907
mv frontend/.git /private/tmp/atlex-git-backup-20260907/frontend.git
mv backend/.git /private/tmp/atlex-git-backup-20260907/backend.git
```

Expected: `find . -mindepth 2 -type d -name .git -print`가 아무것도 출력하지 않고, 두 백업 디렉터리가 `/private/tmp/atlex-git-backup-20260907/` 아래에 존재한다.

- [ ] **Step 5: 루트 `.gitignore`를 공통 규칙으로 채운다**

Replace `.gitignore` with:

```gitignore
# macOS
.DS_Store
**/.DS_Store

# IDEs and editors
.idea/
**/.idea/
.vscode/
**/.vscode/
*.iml

# Environment files
.env
.env.*
**/.env
**/.env.*
!.env.example
!**/.env.example

# Logs and temporary files
*.log
*.tmp
```

- [ ] **Step 6: 무시 규칙과 추적 대상 파일을 검사한다**

Run:

```bash
git check-ignore -v frontend/.env backend/.env frontend/node_modules frontend/.next backend/build backend/docker-compose.override.yml .idea .DS_Store
git add .gitignore frontend backend docs
git diff --cached --check
if git diff --cached --name-only \
  | rg '(^|/)\.env($|\.)|(^|/)node_modules/|(^|/)\.next/|(^|/)build/|(^|/)\.idea/|(^|/)\.DS_Store$|docker-compose\.override\.yml' \
  | rg -v '(^|/)\.env\.example$'; then
  echo "ERROR: ignored or sensitive files are staged"
  exit 1
fi
```

Expected: `git check-ignore`는 각 대상의 적용 규칙을 출력한다. 마지막 `rg`는 `.env.example`만 출력할 수 있으며, 실제 `.env`나 생성물은 출력하면 안 된다. 출력된 환경파일을 `rg -v '(^|/)\.env\.example$'`로 다시 확인했을 때 결과가 없어야 한다.

- [ ] **Step 7: 현재 스냅샷을 루트 Git에 커밋한다**

Run:

```bash
git commit -m "refactor: initialize frontend and backend monorepo"
```

Expected: 프론트엔드와 백엔드 파일이 일반 파일로 커밋되고 gitlink 항목이 없다. 다음 명령의 출력이 없어야 한다.

```bash
git ls-files --stage | awk '$1 == "160000" { print }'
```

---

### Task 2: 프론트엔드 표준 테스트 명령 추가

**Files:**
- Modify: `frontend/package.json`

**Interfaces:**
- Consumes: 기존 `vitest` 개발 의존성 및 `frontend/vitest.config.js`
- Produces: CI와 개발자가 공통으로 호출하는 `npm run test` 명령

- [ ] **Step 1: 아직 테스트 스크립트가 없음을 확인한다**

Run:

```bash
cd frontend
npm run test
```

Expected: `Missing script: "test"`로 실패한다.

- [ ] **Step 2: `frontend/package.json`에 비대화형 테스트 스크립트를 추가한다**

Set the `scripts` object to include this exact entry without changing existing scripts:

```json
"test": "vitest run --passWithNoTests"
```

- [ ] **Step 3: 테스트 명령과 빌드를 검증한다**

Run:

```bash
cd frontend
npm run test
BACKEND_ORIGIN=http://127.0.0.1:8080 BASE_API_URL=http://127.0.0.1:8080/api/v1 npm run build
```

Expected: 두 명령이 exit code 0으로 끝난다.

- [ ] **Step 4: 테스트 명령 변경을 커밋한다**

Run:

```bash
git add frontend/package.json
git commit -m "test: add frontend CI test command"
```

---

### Task 3: 애플리케이션별 CI 워크플로 추가

**Files:**
- Create: `.github/workflows/frontend-ci.yml`
- Create: `.github/workflows/backend-ci.yml`

**Interfaces:**
- Consumes: Task 2의 `npm run test`, 기존 `backend/gradlew`
- Produces: `frontend/**`, `backend/**` 변경에 독립적으로 반응하는 검증 작업

- [ ] **Step 1: 프론트엔드 CI 워크플로를 작성한다**

Create `.github/workflows/frontend-ci.yml`:

```yaml
name: Frontend CI

on:
  push:
    branches: [develop, main]
    paths:
      - "frontend/**"
      - ".github/workflows/frontend-ci.yml"
  pull_request:
    branches: [develop, main]
    paths:
      - "frontend/**"
      - ".github/workflows/frontend-ci.yml"

permissions:
  contents: read

jobs:
  test-and-build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    env:
      BACKEND_ORIGIN: http://127.0.0.1:8080
      BASE_API_URL: http://127.0.0.1:8080/api/v1
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test
      - run: npm run build
```

- [ ] **Step 2: 백엔드 CI 워크플로를 작성한다**

Create `.github/workflows/backend-ci.yml`:

```yaml
name: Backend CI

on:
  push:
    branches: [develop, main]
    paths:
      - "backend/**"
      - ".github/workflows/backend-ci.yml"
  pull_request:
    branches: [develop, main]
    paths:
      - "backend/**"
      - ".github/workflows/backend-ci.yml"

permissions:
  contents: read

jobs:
  test-and-build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "17"
          cache: gradle
          cache-dependency-path: |
            backend/*.gradle
            backend/gradle/wrapper/gradle-wrapper.properties
      - run: ./gradlew test
      - run: ./gradlew bootJar
```

- [ ] **Step 3: YAML 문법과 경로를 검사한다**

Run:

```bash
ruby -e 'require "yaml"; ARGV.each { |path| YAML.parse_file(path); puts "OK #{path}" }' .github/workflows/frontend-ci.yml .github/workflows/backend-ci.yml
rg -n 'working-directory: (frontend|backend)|cache-dependency-path' .github/workflows/frontend-ci.yml .github/workflows/backend-ci.yml
rg -n 'playwright install --with-deps chromium' .github/workflows/frontend-ci.yml
git diff --check
```

Expected: 두 파일 모두 `OK`가 출력되고 경로가 각 애플리케이션 디렉터리를 가리킨다.

- [ ] **Step 4: 애플리케이션 CI를 커밋한다**

Run:

```bash
git add .github/workflows/frontend-ci.yml .github/workflows/backend-ci.yml
git commit -m "ci: add path-filtered application checks"
```

---

### Task 4: PR 자동화 워크플로 통합

> **최종 결정:** AutoLabel만 유지하고 AutoPR은 제거했다. 아래 AutoPR 단계는 초기 이전 작업 기록이다.

**Files:**
- Create: `.github/workflows/auto-label.yml`
- Create: `.github/workflows/auto-pr.yml`
- Delete: `frontend/.github/workflows/AutoLabel.yaml`
- Delete: `frontend/.github/workflows/AutoPR.yaml`
- Delete: `backend/.github/workflows/AutoLabel.yaml`

**Interfaces:**
- Consumes: Conventional Commit 제목 접두사, 저장소 secret `GH_PAT`
- Produces: 저장소 공통 PR 라벨링과 기능 브랜치에서 `develop`으로 향하는 자동 PR

- [ ] **Step 1: AutoLabel을 루트로 이동하고 중복을 제거한다**

Create `.github/workflows/auto-label.yml`:

```yaml
name: AutoLabel

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  label:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - name: Label by commit prefix
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
          REPO: ${{ github.repository }}
        run: |
          LABELS=$(gh pr view "$PR_NUMBER" \
            --repo "$REPO" \
            --json commits \
            --jq '.commits[].messageHeadline | split(":")[0] | split("(")[0] | split("!")[0] | split("/")[0]' \
          | sort -u \
          | while read TYPE; do
              case $TYPE in
                feat|feature) echo "feat" ;;
                fix) echo "fix" ;;
                chore) echo "chore" ;;
                docs) echo "docs" ;;
                refactor) echo "refactor" ;;
                style) echo "style" ;;
                ci) echo "ci" ;;
                test) echo "test" ;;
                build) echo "build" ;;
              esac
            done | sort -u | paste -sd ',')

          if [ -n "$LABELS" ]; then
            gh pr edit "$PR_NUMBER" \
              --repo "$REPO" \
              --add-label "$LABELS"
          fi
```

Delete the nested AutoLabel workflows after creating the root workflow:

```bash
git rm frontend/.github/workflows/AutoLabel.yaml backend/.github/workflows/AutoLabel.yaml
```

- [ ] **Step 2: AutoPR을 루트로 이동한다**

Create `.github/workflows/auto-pr.yml`:

```yaml
name: AutoPR

on:
  push:
    branches-ignore:
      - "main"
      - "develop"

jobs:
  auto-pr:
    permissions:
      contents: read
      pull-requests: write
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Create PR to develop
        env:
          GH_TOKEN: ${{ secrets.GH_PAT }}
          ACTOR: ${{ github.actor }}
          BRANCH: ${{ github.ref_name }}
          REPO: ${{ github.repository }}
        run: |
          CHANGED_FILES=$(git diff --name-only origin/develop...HEAD | sed 's/^/- /')
          cat > /tmp/pr_body.md << EOF
          Auto-generated PR from \`$BRANCH\`

          ## 작성자
          $ACTOR

          ## 변경된 파일
          $CHANGED_FILES
          EOF

          PR_NUMBER=$(gh pr list \
            --repo "$REPO" \
            --head "$BRANCH" \
            --base develop \
            --state open \
            --json number \
            --jq '.[0].number // empty')

          if [ -z "$PR_NUMBER" ]; then
            gh pr create \
              --repo "$REPO" \
              --head "$BRANCH" \
              --base develop \
              --title "$BRANCH → develop" \
              --body-file /tmp/pr_body.md
          else
            gh pr edit "$PR_NUMBER" \
              --repo "$REPO" \
              --body-file /tmp/pr_body.md
          fi
```

Delete the nested AutoPR workflow after creating the root workflow:

```bash
git rm frontend/.github/workflows/AutoPR.yaml
```

- [ ] **Step 3: 중복 제거와 YAML 문법을 검증한다**

Run:

```bash
test ! -e frontend/.github/workflows/AutoLabel.yaml
test ! -e frontend/.github/workflows/AutoPR.yaml
test ! -e backend/.github/workflows/AutoLabel.yaml
ruby -e 'require "yaml"; ARGV.each { |path| YAML.parse_file(path); puts "OK #{path}" }' .github/workflows/auto-label.yml .github/workflows/auto-pr.yml
rg -n 'base develop|origin/develop\.\.\.HEAD|GH_PAT' .github/workflows/auto-pr.yml
```

Expected: 삭제 확인이 성공하고 두 YAML 파일이 파싱되며 AutoPR의 기준 브랜치가 모두 `develop`이다.

- [ ] **Step 4: PR 자동화를 커밋한다**

Run:

```bash
git add .github/workflows/auto-label.yml .github/workflows/auto-pr.yml
git commit -m "ci: consolidate pull request automation"
```

---

### Task 5: OpenAPI 자동 갱신을 모노레포 경로로 이전

> **최종 결정:** Springdoc의 런타임 `/v3/api-docs`와 Swagger UI만 사용하기로 하여 자동 갱신 워크플로와 추적 JSON을 제거했다. 아래 단계는 초기 이전 작업 기록이다.

**Files:**
- Create: `.github/workflows/openapi-spec.yml`
- Delete: `backend/.github/workflows/openapi-spec.yml`

**Interfaces:**
- Consumes: `backend/gradlew`, 백엔드 `/v3/api-docs`, `backend/docs/openapi.json`
- Produces: `develop`의 백엔드 변경 후 갱신되는 OpenAPI 문서

- [ ] **Step 1: 루트 OpenAPI 워크플로를 작성한다**

Create `.github/workflows/openapi-spec.yml`:

```yaml
name: Update OpenAPI Spec

on:
  push:
    branches: [develop]
    paths:
      - "backend/src/**"
      - "backend/build.gradle"
      - "backend/settings.gradle"
      - ".github/workflows/openapi-spec.yml"
  workflow_dispatch:

permissions:
  contents: write

jobs:
  update-spec:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: "17"
          distribution: temurin
          cache: gradle
          cache-dependency-path: |
            backend/*.gradle
            backend/gradle/wrapper/gradle-wrapper.properties
      - name: Build app
        run: ./gradlew bootJar -x test
      - name: Start app
        run: java -jar build/libs/app.jar &
        env:
          JWT_SECRET: ci-dummy-secret-not-used-in-prod
      - name: Wait for app to be ready
        run: |
          for i in $(seq 1 30); do
            if curl -sf http://localhost:8080/v3/api-docs > /dev/null; then
              exit 0
            fi
            echo "Waiting... ($i/30)"
            sleep 3
          done
          echo "App did not start in time"
          exit 1
      - name: Export OpenAPI spec
        run: curl -s http://localhost:8080/v3/api-docs | jq . > docs/openapi.json
      - name: Commit if changed
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add docs/openapi.json
          if git diff --cached --quiet; then
            echo "openapi.json unchanged — skipping commit"
          else
            git commit -m "docs: update OpenAPI spec [skip ci]"
            git push
          fi
```

- [ ] **Step 2: 기존 중첩 워크플로를 삭제하고 경로를 검증한다**

Run:

```bash
git rm backend/.github/workflows/openapi-spec.yml
test ! -e backend/.github/workflows/openapi-spec.yml
ruby -e 'require "yaml"; YAML.parse_file(ARGV.fetch(0)); puts "OK"' .github/workflows/openapi-spec.yml
rg -n 'working-directory: backend|docs/openapi\.json|backend/src' .github/workflows/openapi-spec.yml
```

Expected: 루트 워크플로만 남고, 작업 디렉터리는 `backend`, trigger 경로는 `backend/**`, 생성 파일은 백엔드 작업 디렉터리 기준 `docs/openapi.json`이다.

- [ ] **Step 3: OpenAPI 자동화를 커밋한다**

Run:

```bash
git add .github/workflows/openapi-spec.yml
git commit -m "ci: migrate OpenAPI generation to monorepo"
```

---

### Task 6: 백엔드 배포 워크플로를 모노레포 경로로 이전

**Files:**
- Create: `.github/workflows/deploy-backend.yml`
- Delete: `backend/.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: `backend/Dockerfile`, `backend/docker-compose.yml`, GitHub secrets `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`
- Produces: `ghcr.io/mokwon-atlex/atlex` 이미지와 EC2 재배포 시도

- [ ] **Step 1: 루트 백엔드 배포 워크플로를 작성한다**

Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - "backend/**"
      - ".github/workflows/deploy-backend.yml"
  workflow_dispatch:

env:
  IMAGE: ghcr.io/${{ github.repository_owner }}/atlex

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v6
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: true
          tags: |
            ${{ env.IMAGE }}:latest
            ${{ env.IMAGE }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          command_timeout: 30m
          script: |
            cd ~/atlex
            git fetch origin main
            git checkout main
            git pull --ff-only origin main
            docker compose -f backend/docker-compose.yml pull
            docker compose -f backend/docker-compose.yml up -d
            docker image prune -f
```

- [ ] **Step 2: 배포 YAML과 Docker 경로를 정적으로 검증한다**

Run:

```bash
ruby -e 'require "yaml"; YAML.parse_file(ARGV.fetch(0)); puts "OK"' .github/workflows/deploy-backend.yml
rg -n 'context: ./backend|file: ./backend/Dockerfile|branches: \[main\]|backend/docker-compose\.yml' .github/workflows/deploy-backend.yml
docker compose -f backend/docker-compose.yml config
```

Expected: YAML 파싱이 성공하고 모든 빌드·Compose 경로가 `backend/`를 기준으로 한다. Compose 검증은 엔진 실행 없이 구성을 출력한다. 로컬 Docker CLI가 없으면 그 사실을 기록하고 GitHub Actions의 이미지 빌드 결과로 대체 검증한다.

- [ ] **Step 3: 기존 배포 워크플로를 삭제하고 커밋한다**

Run:

```bash
git rm backend/.github/workflows/deploy.yml
git add .github/workflows/deploy-backend.yml
git commit -m "ci: migrate backend deployment to monorepo"
```

---

### Task 7: 루트 사용·운영 문서 작성

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: 최종 디렉터리 구조, 애플리케이션 명령, 브랜치 흐름, 외부 배포 설정
- Produces: macOS·Linux·Windows 개발자와 운영자가 따를 수 있는 단일 진입 문서

- [ ] **Step 1: 루트 README에 저장소 구조와 로컬 실행법을 작성한다**

The README must contain this exact content:

````markdown
# Atlex

Atlex 프론트엔드와 백엔드를 함께 관리하는 모노레포입니다.

## 구조

- `frontend/`: Next.js 16
- `backend/`: Spring Boot 4, Java 17

## 프론트엔드

`frontend/.env.example`을 참고해 `frontend/.env`를 만든 뒤 실행합니다.

`BACKEND_ORIGIN`에는 `/api/v1`을 제외한 백엔드 origin을, `BASE_API_URL`에는 `/api/v1`을 포함한 주소를 설정합니다.

```bash
cd frontend
npm ci
npm run dev
```

검증 명령은 `npm run test`, `npm run build`입니다.

## 백엔드

macOS/Linux:

```bash
cd backend
./gradlew bootRun
```

Windows PowerShell:

```powershell
cd backend
.\gradlew.bat bootRun
```

검증 명령은 `./gradlew test`와 `./gradlew bootJar`이며, Windows에서는 `gradlew.bat`을 사용합니다.

## 브랜치

- 기능·수정 브랜치는 `develop`에서 분기하고 `develop`으로 PR을 생성합니다.
- 운영 배포는 `develop`에서 `main`으로 PR을 병합하여 진행합니다.

## 배포 설정

- Vercel: 저장소 `mokwon-atlex/atlex`, Root Directory `frontend`, Production Branch `main`
- 백엔드: `main`의 `backend/**` 변경 시 GHCR 이미지 빌드 후 EC2 배포
- EC2가 오프라인이면 SSH 배포 단계가 실패할 수 있으며, 이미지 빌드 성공 여부와 구분해서 확인합니다.
````

- [ ] **Step 2: 문서의 명령과 링크를 검사한다**

Run:

```bash
rg -n 'npm run (dev|test|build)|gradlew(\.bat)? (bootRun|test|bootJar)|Root Directory|BACKEND_ORIGIN|BASE_API_URL' README.md
git diff --check
```

Expected: 프론트엔드와 두 운영체제용 백엔드 명령, Vercel 설정, 두 환경변수 설명이 모두 검색된다.

- [ ] **Step 3: 루트 문서를 커밋한다**

Run:

```bash
git add README.md
git commit -m "docs: add monorepo development and deployment guide"
```

---

### Task 8: 전체 검증과 원격 전환 준비

**Files:**
- Verify: `.gitignore`
- Verify: `.github/workflows/*.yml`
- Verify: `frontend/**`
- Verify: `backend/**`
- Verify: `README.md`

**Interfaces:**
- Consumes: Tasks 1–7의 모든 커밋
- Produces: push 가능한 깨끗한 `develop` 브랜치와 외부 설정 체크리스트

- [ ] **Step 1: 전체 애플리케이션 검증을 실행한다**

Run:

```bash
cd frontend
npm run test
BACKEND_ORIGIN=http://127.0.0.1:8080 BASE_API_URL=http://127.0.0.1:8080/api/v1 npm run build
cd ../backend
./gradlew test
./gradlew bootJar
```

Expected: 모든 명령이 exit code 0으로 끝난다.

- [ ] **Step 2: Git 경계와 민감 파일을 최종 검사한다**

Run from repository root:

```bash
if find . -mindepth 2 -type d -name .git -print | rg .; then
  echo "ERROR: nested Git metadata exists"
  exit 1
fi
if git ls-files --stage | awk '$1 == "160000" { print }' | rg .; then
  echo "ERROR: a gitlink is tracked"
  exit 1
fi
if git ls-files | rg '(^|/)\.env($|\.)' | rg -v '(^|/)\.env\.example$'; then
  echo "ERROR: a non-example environment file is tracked"
  exit 1
fi
if git ls-files | rg '(^|/)(node_modules|\.next|build|\.idea)/|(^|/)\.DS_Store$|docker-compose\.override\.yml'; then
  echo "ERROR: generated or local-only files are tracked"
  exit 1
fi
git status --short --branch
test -z "$(git status --porcelain)"
```

Expected: 첫 네 검사는 아무것도 출력하지 않는다. 마지막 상태는 `## develop`만 출력하고 작업 트리는 깨끗하다.

- [ ] **Step 3: 모든 워크플로 YAML을 파싱한다**

Run:

```bash
ruby -e 'require "yaml"; Dir[".github/workflows/*.{yml,yaml}"].sort.each { |path| YAML.parse_file(path); puts "OK #{path}" }'
```

Expected: 루트의 모든 워크플로 파일에 대해 `OK`가 출력된다.

- [ ] **Step 4: 외부 설정 항목을 사용자에게 전달한다**

Report exactly these required actions:

1. GitHub 저장소 secret `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY` 등록
2. GitHub 기본 브랜치를 `develop`으로 설정하고 `develop`, `main` 브랜치 보호 규칙 구성
3. Vercel 프로젝트를 `mokwon-atlex/atlex`에 연결하고 Root Directory를 `frontend`, Production Branch를 `main`으로 설정
4. Vercel Production·Preview 환경에 `BACKEND_ORIGIN`, `BASE_API_URL` 등록
5. EC2를 다시 켠 뒤 `~/atlex` checkout을 새 모노레포로 전환하고 수동 배포 확인

- [ ] **Step 5: 원격 push 승인 지점에서 멈춘다**

Present the clean status, commit list, verification results, and the exact commands that will run after approval:

```bash
git push -u origin develop
git branch main develop
git push -u origin main
git switch develop
```

Expected: 사용자 승인 전에는 이 명령들을 실행하지 않는다. 승인 후 `develop`과 `main`을 push하며, `main` 최초 push에서 EC2 SSH 단계가 오프라인으로 실패할 수 있음을 보고한다.

---

## 복구 메모

루트 소스 스냅샷 커밋 전 복구가 필요하면 다음 명령을 실행한다.

```bash
test ! -e frontend/.git
test ! -e backend/.git
mv /private/tmp/atlex-git-backup-20260907/frontend.git frontend/.git
mv /private/tmp/atlex-git-backup-20260907/backend.git backend/.git
```

루트 커밋이 검증된 후에도 기존 GitHub 원본 저장소는 전체 이력의 장기 복구 수단으로 남는다. 임시 백업 삭제는 별도 승인 없이는 수행하지 않는다.
