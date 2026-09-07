# 코드 품질 개선 백로그

작성 기준일: 2026-06-22

이 문서는 현재 코드 기준으로 확인한 개선 항목을 추후 작업하기 쉽도록 정리한 백로그입니다. 평가는 가독성, 에러 가능성, 코드 중복, 테스트 범위, 운영 안정성을 기준으로 했습니다.

## 평가 요약

| 항목 | 점수 | 판단 |
| --- | ---: | --- |
| 정확성/보안 | 2.5/5 | 로그인 실패 잠금, admin 권한, 비활성 사용자 토큰 처리가 우선 리스크 |
| 가독성 | 3.8/5 | 패키지와 계층 구조는 명확하지만 일부 책임 위치와 문서가 더 정리될 수 있음 |
| 중복 | 3.2/5 | pagination 검증, active 사용자 조회, 소유자 검증 로직이 반복됨 |
| 예외 처리 | 3.5/5 | 공통 예외 구조는 있으나 전역 500 처리에 로그가 없음 |
| 테스트 | 3.0/5 | post/category/profile/tag 테스트는 있으나 auth/user/admin/security 핵심 테스트가 부족 |
| 운영 안정성 | 2.8/5 | prod `ddl-auto:update`, 기본 JWT secret, admin 권한 미분리 개선 필요 |

## P0: 먼저 고칠 항목

### 로그인 실패 카운트와 계정 잠금 저장 보장

현재 위치:

- `domain.auth.service.AuthService#login`

문제:

- 로그인 실패 시 `failCount`, `lockedUntil`을 변경한 뒤 `AuthenticationException`을 던집니다.
- 메서드가 `@Transactional`이므로 RuntimeException 때문에 변경 사항이 롤백될 수 있습니다.
- 이 경우 5회 실패 잠금 정책이 실제로 동작하지 않을 수 있습니다.

개선 방향:

- 실패 기록 저장을 별도 `REQUIRES_NEW` 트랜잭션으로 분리합니다.
- 또는 `@Transactional(noRollbackFor = AuthenticationException.class)` 적용 가능성을 검토합니다.
- 실패 카운트 증가, 잠금 설정, 성공 시 초기화 테스트를 추가합니다.

검증 기준:

- 비밀번호 5회 실패 후 `lockedUntil`이 저장되어야 합니다.
- 잠금 상태의 로그인은 429를 반환해야 합니다.
- 성공 로그인 후 `failCount`와 `lockedUntil`이 초기화되어야 합니다.

### Admin API 권한 분리

현재 위치:

- `domain.admin.user.controller.AdminUserController`
- `global.config.SecurityConfig`
- `global.security.principal.PrincipalDetails`

문제:

- `/api/v1/admin/users`는 인증만 필요하고 관리자 역할은 검사하지 않습니다.
- `PrincipalDetails`는 모든 사용자에게 `ROLE_USER`만 부여합니다.

개선 방향:

- `User`에 role 또는 authority 필드를 추가합니다.
- `PrincipalDetails#getAuthorities()`에서 사용자 권한을 반영합니다.
- `SecurityConfig` 또는 `@PreAuthorize`로 `/api/v1/admin/**`를 `ROLE_ADMIN`에 제한합니다.
- admin 접근 성공/실패 테스트를 추가합니다.

검증 기준:

- 비로그인 사용자는 401을 받아야 합니다.
- 일반 로그인 사용자는 403을 받아야 합니다.
- 관리자 사용자는 200을 받아야 합니다.

### 비활성 사용자와 잠긴 사용자 토큰 차단

현재 위치:

- `global.security.principal.CustomUserDetailsService`
- `global.security.jwt.JwtAuthenticationFilter`
- `domain.post.service.PostService#createPost`
- `domain.auth.service.AuthService#reissue`

문제:

- JWT 인증 시 `findById()`로 사용자를 조회하므로 비활성 사용자도 principal로 로드될 수 있습니다.
- 필터가 `UserDetails#isEnabled()`와 `isAccountNonLocked()`를 명시적으로 확인하지 않습니다.
- 게시글 생성과 토큰 재발급 일부 경로도 active 여부 확인이 일관되지 않습니다.

개선 방향:

- JWT 인증 로드는 `findByIdAndActiveTrue()`로 통일합니다.
- 잠금 상태를 토큰 인증에서도 막을지 정책을 정하고 구현합니다.
- 생성/수정/재발급 등 보호 기능에서 active 사용자만 허용합니다.

검증 기준:

- 비활성 사용자의 기존 access token으로 보호 API를 호출하면 401 또는 403을 반환해야 합니다.
- 비활성 사용자의 refresh token 재발급은 실패해야 합니다.
- 잠긴 사용자의 기존 token 처리 정책이 테스트로 고정되어야 합니다.

## P1: 유지보수성과 운영 안정성

### User 엔티티 무결성 강화

현재 위치:

- `domain.user.entity.User`
- `src/main/resources/sql/schema.sql`

문제:

- `User` 엔티티에는 unique, nullable, length 제약이 코드로 충분히 표현되어 있지 않습니다.
- `@Setter`가 클래스 전체에 열려 있어 도메인 변경 경로가 넓습니다.

개선 방향:

- `userId`, `email`, `password`, `name`, `active` 등에 `@Column` 제약을 명시합니다.
- DB 제약과 엔티티 제약을 맞춥니다.
- 클래스 레벨 `@Setter`를 제거하고 필요한 도메인 메서드만 유지합니다.

### 운영 DB 스키마 관리 방식 개선

현재 위치:

- `src/main/resources/application.yaml`
- `src/main/resources/sql/schema.sql`

문제:

- 운영 프로필에서 `spring.jpa.hibernate.ddl-auto=update`를 사용합니다.
- 운영 DB 변경 이력을 명시적으로 추적하기 어렵습니다.

개선 방향:

- Flyway 또는 Liquibase를 도입합니다.
- 운영 프로필은 `ddl-auto=validate` 또는 `none`으로 전환합니다.
- `schema.sql`은 로컬 참고용인지, 테스트 초기화용인지 용도를 명확히 분리합니다.

### JWT 설정 외부화 강화

현재 위치:

- `src/main/resources/application.yaml`
- `global.security.jwt.JwtProvider`

문제:

- 기본 JWT secret이 코드 저장소 설정에 포함되어 있습니다.
- access/refresh 만료 시간이 코드 상수로 고정되어 있습니다.

개선 방향:

- prod에서는 `JWT_SECRET` 미설정 시 부팅 실패하도록 분리합니다.
- token 만료 시간을 설정 프로퍼티로 이동합니다.
- secret 길이와 알고리즘 요구사항을 설정 검증으로 확인합니다.

### 예외 로깅 추가

현재 위치:

- `global.exception.common.GlobalExceptionHandler`

문제:

- `Exception.class` 핸들러가 내부 예외를 500 응답으로 감싸지만 로그를 남기지 않습니다.

개선 방향:

- 예상하지 못한 예외는 error 레벨 로그를 남깁니다.
- validation/custom exception은 필요시 warn 또는 debug로 제한합니다.

## P2: 중복과 API 일관성

### Pagination 검증 공통화

현재 위치:

- `domain.category.service.CategoryService`
- `domain.tag.service.TagService`

문제:

- `DEFAULT_LIMIT`, `MAX_LIMIT`, `normalizeLimit`, `validateCursor`가 반복됩니다.

개선 방향:

- 작은 유틸리티 또는 value object로 분리합니다.
- category는 `id DESC`, tag는 `id ASC`라서 정렬 정책은 각 서비스에 남깁니다.

### 소유자 검증과 active 사용자 조회 공통화

현재 위치:

- `CategoryService#findActiveUser`
- `TagService#findActiveUser`
- `ProfileService`, `UserService`, `PostService`

문제:

- active 사용자 조회와 본인 여부 검사가 여러 서비스에 흩어져 있습니다.

개선 방향:

- `UserReader`, `CurrentUserGuard` 같은 작은 도메인 서비스 도입을 검토합니다.
- 단, 단순 추출만으로 추상화가 과해지지 않도록 호출부가 줄어드는 경우에만 적용합니다.

### Deprecated API 정리

현재 위치:

- `AuthController#signup`
- `UserController#checkEmailDeprecated`
- `UserController#findAllDeprecated`

문제:

- deprecated API가 남아 있어 문서와 보안 규칙을 계속 복잡하게 만듭니다.

개선 방향:

- 클라이언트 전환 여부를 확인한 뒤 제거 일정을 정합니다.
- 제거 전까지는 README와 Swagger에 deprecated 상태를 명확히 유지합니다.

## 테스트 보강 제안

우선 추가할 테스트:

- `AuthServiceTest`: 로그인 실패 카운트, 잠금, 성공 초기화, 비활성 로그인 실패
- `AuthControllerTest`: login/reissue/logout 응답 코드
- `AdminUserControllerTest`: 비로그인, 일반 사용자, 관리자 접근
- `JwtAuthenticationFilterTest` 또는 통합 테스트: invalid token, inactive user token, locked user token
- `UserServiceTest`: 중복 userId/email race condition에 대한 DB 제약 처리

현재 확인한 기준선:

```text
sh gradlew test
BUILD SUCCESSFUL
```
