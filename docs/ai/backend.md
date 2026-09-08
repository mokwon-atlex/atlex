# 백엔드 AI 작업 지침

이 문서는 `backend/**`를 변경할 때 `docs/ai/README.md`와 함께 적용합니다. 코딩 컨벤션은 `CONTRIBUTING.md`의 백엔드 항목을 원본으로 사용합니다.

## 작업 전 확인

- 변경할 도메인의 Controller, Service, Repository, Entity, DTO와 인접 테스트의 기존 경계를 먼저 확인합니다.
- API 변경이 프론트엔드 소비 코드와 Swagger 계약에 미치는 영향을 확인합니다.
- Gradle은 저장소에 포함된 Wrapper를 사용하고 전역 Gradle 설치에 의존하지 않습니다.
- 실제 환경 변수, 인증서와 운영 설정을 사용자 승인 없이 열거나 수정하지 않습니다.

## 구현과 검증

- API 계약을 변경하면 요청·응답 DTO, 프론트엔드 소비 코드, Swagger와 테스트를 함께 갱신합니다.
- DB 구조와 마이그레이션은 계획과 사용자 승인을 받은 뒤 변경합니다.
- 트랜잭션 경계, 지연 로딩, 예외 응답과 권한 검사를 함께 검토합니다.
- 외부 API, 시간과 실행 순서 의존성은 테스트에서 제어할 수 있는 경계로 분리합니다.
- 배포 워크플로우와 운영 환경은 사용자 승인 없이 실행하거나 변경하지 않습니다.

변경 영역 검증은 저장소 루트에서 실행합니다.

```bash
npm run check:backend
```

백엔드 검사를 개별 실행할 때는 현재 운영체제에 맞는 Gradle Wrapper를 사용합니다.

```bash
# macOS/Linux
cd backend
./gradlew spotlessCheck
./gradlew test
./gradlew bootJar

# Windows PowerShell
cd backend
.\gradlew.bat spotlessCheck
.\gradlew.bat test
.\gradlew.bat bootJar
```

PR 생성 전에는 저장소 루트에서 `npm run check` 전체 검사를 실행합니다.
