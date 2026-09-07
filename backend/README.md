# Atlex Backend

Spring Boot 기반 Atlex 백엔드입니다. 패키지 구조는 애플리케이션 공통 영역인 `global`과 비즈니스 기능 영역인 `domain`으로 나뉩니다.

## 실행 및 검증

```bash
sh gradlew test
```

로컬 기본 프로필은 H2 파일 DB를 사용합니다. 운영 프로필은 `SPRING_PROFILES_ACTIVE=prod`로 활성화하며 MySQL 연결 정보는 환경변수로 주입합니다.

## 패키지 구조

```text
src/main/java/com/example/atlex
├── AtlexApplication.java
├── global
│   ├── config
│   ├── exception
│   ├── response
│   ├── security
│   │   ├── jwt
│   │   └── principal
│   └── validation
└── domain
    ├── admin
    ├── auth
    ├── user
    ├── profile
    ├── post
    ├── category
    └── tag
```

## 도메인 역할

- `domain.admin`: 관리자용 사용자 조회 API
- `domain.auth`: 로그인, 토큰 재발급, 로그아웃, Refresh Token 관리
- `domain.user`: 회원가입, 사용자 조회, 이메일 중복 확인, 계정 수정, 비밀번호 변경, 탈퇴 흐름
- `domain.profile`: 공개 프로필 조회 및 수정
- `domain.post`: 게시글 생성, 목록 조회, 상세 조회, 수정, soft delete
- `domain.category`: 사용자별 카테고리 목록, 생성, 수정, 삭제
- `domain.tag`: 사용자별 태그 목록 조회
- `global`: 보안 설정, JWT 필터/프로바이더, 인증 principal, 예외, 공통 응답, 공통 validation

## 주요 API

### Auth

| Method | URL | 인증 | 설명 |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/signup` | 불필요 | 회원가입, deprecated. `POST /api/v1/users` 사용 권장 |
| POST | `/api/v1/auth/login` | 불필요 | 로그인 |
| POST | `/api/v1/auth/reissue` | 불필요 | Access/Refresh Token 재발급 |
| POST | `/api/v1/auth/logout` | 필요 | Refresh Token 삭제 |

### User

| Method | URL | 인증 | 설명 |
| --- | --- | --- | --- |
| POST | `/api/v1/users` | 불필요 | 회원가입 |
| GET | `/api/v1/users?email={email}` | 불필요 | 이메일 중복 확인 |
| POST | `/api/v1/users/email/check` | 불필요 | 이메일 중복 확인, deprecated |
| GET | `/api/v1/users/{userId}` | 필요 | 본인 사용자 정보 조회 |
| PATCH | `/api/v1/users/{userId}` | 필요 | 본인 사용자 정보 수정 |
| PATCH | `/api/v1/users/{userId}/password` | 필요 | 본인 비밀번호 변경 |
| DELETE | `/api/v1/users/{userId}` | 필요 | 본인 계정 비활성화 및 관련 데이터 정리 |
| GET | `/api/v1/users/all` | 필요 | 전체 사용자 목록 조회, deprecated |

### Admin

| Method | URL | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/api/v1/admin/users` | 필요 | 전체 사용자 목록 조회 |

현재 코드는 관리자 권한 모델을 별도로 두지 않으므로, 인증된 사용자라면 admin 경로에 접근할 수 있습니다. 개선 항목은 [code-quality-improvements.md](docs/code-quality-improvements.md)에 정리되어 있습니다.

### Profile

| Method | URL | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/api/v1/profiles/{userId}` | 불필요 | 공개 프로필 조회 |
| PATCH | `/api/v1/profiles/{userId}` | 필요 | 본인 공개 프로필 수정 |

### Post

| Method | URL | 인증 | 설명 |
| --- | --- | --- | --- |
| POST | `/api/v1/posts` | 필요 | 게시글 작성 |
| GET | `/api/v1/posts` | 선택 | 게시글 목록 조회 |
| GET | `/api/v1/posts/{postId}` | 선택 | 게시글 상세 조회 |
| PATCH | `/api/v1/posts/{postId}` | 필요 | 본인 게시글 수정 |
| DELETE | `/api/v1/posts/{postId}` | 필요 | 본인 게시글 soft delete |

게시글 목록 조회 파라미터:

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `type` | 아니오 | `latest` 또는 `trending`. 그 외 값은 `latest`로 처리 |
| `userId` | 아니오 | 작성자 userId 필터 |
| `categoryId` | 아니오 | 카테고리 ID 필터 |
| `page`, `size`, `sort` | 아니오 | Spring `Pageable` 파라미터 |

### Comment

| Method | URL | 인증 | 설명 |
| --- | --- | --- | --- |
| POST | `/api/v1/posts/{postId}/comments` | 필요 | 댓글 작성 (비공개 게시글은 작성자 본인만) |
| GET | `/api/v1/posts/{postId}/comments` | 선택 | 게시글 댓글 목록 조회 |
| PATCH | `/api/v1/comments/{commentId}` | 필요 | 본인 댓글 수정 |
| DELETE | `/api/v1/comments/{commentId}` | 필요 | 댓글 작성자 또는 게시글 작성자가 soft delete |

- 댓글 목록 조회는 현재 **페이지네이션을 지원하지 않습니다.** 전체 댓글 목록을 `createdAt ASC, id ASC` 순으로 반환합니다.
- 비공개 게시글의 댓글은 게시글 작성자 본인에게만 노출됩니다. soft delete된 게시글의 댓글은 조회/작성/수정/삭제가 모두 불가합니다.

### Post Like

| Method | URL | 인증 | 설명 |
| --- | --- | --- | --- |
| POST | `/api/v1/posts/{postId}/likes` | 필요 | 좋아요 등록 (이미 좋아요했으면 중복 증가 없음) |
| DELETE | `/api/v1/posts/{postId}/likes` | 필요 | 좋아요 취소 (안 눌렀어도 에러 없이 멱등 처리) |

- 응답 `data`는 `{ postId, liked, likes }` 형태입니다. 등록/취소 모두 최신 좋아요 수(`likes`)를 반환합니다.
- 게시글 접근 정책은 조회와 동일합니다. 존재하지 않음 / soft delete / 비공개(비작성자) 게시글은 `POST_NOT_FOUND`(404)로 처리됩니다.
- 같은 사용자의 중복 좋아요는 `(user_id, post_id)` unique 제약과 서비스 로직으로 이중 차단되며, `likes` 카운트는 원자적 UPDATE로 갱신됩니다.
- **동시성 주의:** 순차 중복 좋아요는 멱등하게 처리되지만, 같은 사용자의 **진짜 동시 요청**이 unique 제약을 동시에 위반하면 해당 트랜잭션이 rollback-only가 되어 드물게 **500**으로 끝날 수 있습니다. 이 경우에도 데이터 무결성은 유지되며(중복 저장·카운트 중복 증가 없음), **재시도하면 정상적으로 멱등 처리(200)** 됩니다.

### Category

| Method | URL | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/api/v1/users/{userId}/categories` | 선택 | 사용자별 카테고리 목록 조회 |
| POST | `/api/v1/users/{userId}/categories` | 필요 | 본인 카테고리 생성 |
| PATCH | `/api/v1/users/{userId}/categories/{categoryId}` | 필요 | 본인 카테고리 수정 |
| DELETE | `/api/v1/users/{userId}/categories/{categoryId}` | 필요 | 본인 카테고리 삭제 |

카테고리 목록 조회 파라미터:

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `limit` | 아니오 | 기본 10, 최대 50 |
| `cursor` | 아니오 | 이전 응답의 `nextCursor` |

### Tag

| Method | URL | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/api/v1/tags?userId={userId}` | 선택 | 사용자별 태그 목록 조회 |

태그 목록 조회 파라미터:

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `userId` | 예 | 태그 목록을 조회할 사용자 ID |
| `limit` | 아니오 | 기본 10, 최대 50 |
| `cursor` | 아니오 | 이전 응답의 `nextCursor` |

## 인증 및 응답

- JWT 기반 인증을 사용합니다.
- `JwtAuthenticationFilter`가 `Authorization: Bearer <token>` 헤더를 검증합니다.
- 인증 헤더가 없으면 익명 사용자로 통과하며, 보호 API는 Spring Security에서 401로 처리합니다.
- 잘못된 Authorization 헤더나 유효하지 않은 토큰은 401로 응답합니다.
- 인증된 사용자는 `PrincipalDetails`로 컨트롤러에 주입됩니다.
- API 응답은 `ApiResponse` 형태를 사용합니다. 단, 204 응답은 본문이 없습니다.

성공 응답:

```json
{
  "code": "SUCCESS",
  "message": "처리 메시지 또는 null",
  "data": {},
  "errors": null
}
```

실패 응답:

```json
{
  "code": "ERROR_CODE",
  "message": "에러 메시지",
  "data": null,
  "errors": []
}
```

## 관련 문서

- [Backend 구조 요약](docs/backend-summary.md)
- [Post, Category, Tag 도메인 요약](docs/post-module-summary.md)
- [코드 품질 개선 백로그](docs/code-quality-improvements.md)
