# 모노레포 최초 Push 전 운영 안전성 보완 계획

> 최종 전체 리뷰에서 발견된 Important 항목을 최초 원격 push 전에 해소한다. 각 Task는 구현·검증·독립 리뷰 후 다음 Task로 진행한다.

> **범위 조정 (2026-09-08):** 사용자와 검증 수준을 재평가한 결과 Task 9만 최초 push 전 필수 보완으로 완료한다. Task 10~13은 모노레포 통합의 필수 조건이 아닌 운영 고도화 권장사항으로 이관하며, 이번 작업의 push를 차단하지 않는다.

## Task 9: 외부 PR 라벨링 안전화

**Files:** `.github/workflows/auto-label.yml`

- `pull_request_target`을 사용하되 PR 코드를 checkout하거나 실행하지 않는다.
- `contents: read`, `pull-requests: write`, `issues: write`만 부여한다.
- 선택된 Conventional Commit 라벨이 없으면 저장소에 idempotent하게 생성한 후 PR에 적용한다.
- 내부 PR, fork PR, 라벨 미존재, API 실패를 mock `gh`로 검증한다.
- Commit: `ci: harden pull request automation`

## Task 10: required check와 호환되는 path-filtered CI

**Files:** `.github/workflows/frontend-ci.yml`, `.github/workflows/backend-ci.yml`

- workflow 자체는 `develop`/`main` push와 PR에서 항상 시작한다.
- 각 workflow의 단일 job 안에서 `dorny/paths-filter@v3`로 변경 경로를 판정한다.
- 관련 경로일 때만 설치·테스트·빌드를 수행하고, 관련 없는 변경은 명시적 no-op 성공으로 끝낸다.
- job/check 이름은 `frontend-test-and-build`, `backend-test-and-build`로 고유하게 한다.
- frontend/backend 및 docs-only 변경에서 필터 결과와 required check 생성 여부를 정적으로 검증한다.
- Commit: `ci: make application checks branch-protection safe`

## Task 11: OpenAPI 변경을 보호 브랜치용 PR로 전환

> **취소:** 정적 OpenAPI JSON을 추적하지 않고 Springdoc의 런타임 `/v3/api-docs`와 Swagger UI를 사용한다.

## Task 12: 불변 이미지와 health 기반 백엔드 배포

**Files:** `.github/workflows/deploy-backend.yml`, `backend/docker-compose.yml`, `backend/Dockerfile`

- production deploy concurrency를 직렬화하고, SHA tag를 실제 배포 이미지로 사용한다.
- EC2의 `origin/main` HEAD가 실행 SHA와 다르면 오래된 실행으로 판단해 배포를 건너뛴다.
- 런타임 이미지에 health probe 도구를 제공하고 app service healthcheck를 추가한다.
- `docker compose up -d --wait --wait-timeout`으로 기동 완료를 검증한 뒤에만 성공 처리한다.
- Compose config와 Dockerfile build check, 오래된 SHA skip 및 health 실패 전파를 검증한다.
- Commit: `ci: harden backend production deployment`

## Task 13: Certbot 비밀 경로와 로컬 작업 보고서 정리

**Files:** `.gitignore`, `backend/.gitignore`, `backend/.dockerignore`, tracked SDD reports

- `backend/nginx/certbot/conf/**`, `www/**` 내용을 Git에서 제외하되 `.gitkeep`은 유지한다.
- 같은 경로를 backend Docker build context에서도 제외한다.
- 실수로 추적된 SDD task report 두 개를 index에서만 제거하고 로컬 파일은 보존한다.
- private key/certificate fixture와 `.gitkeep`의 ignore 결과, tracked 파일 목록을 검증한다.
- Commit: `chore: exclude local integration and certificate artifacts`

## Task 14: 최종 재검증과 push 승인

- 프론트 테스트·기본 production build와 백엔드 test·bootJar를 다시 실행한다.
- 모든 workflow YAML, shell block, Compose config를 검증한다.
- nested Git/gitlink, 민감 파일, 중복 workflow, 작업 트리 상태를 재확인한다.
- 전체 branch review에서 Important 이상이 0건인지 확인한다.
- EC2 live deploy는 인스턴스 offline 조건에 따라 실행하지 않는다.
- 원격 push는 사용자 명시 승인 전 실행하지 않는다.
