# Backend 구조 요약

## 패키지 구조

```text
com.example.atlex
├── global
│   ├── config
│   │   └── SecurityConfig
│   ├── exception
│   │   ├── common/CustomException
│   │   ├── error/ErrorCode
│   │   ├── error/ErrorData
│   │   └── GlobalExceptionHandler
│   ├── response
│   │   ├── ApiResponse
│   ├── security
│   │   ├── jwt
│   │   │   ├── JwtAuthenticationFilter
│   │   │   └── JwtProvider
│   │   └── principal
│   │       ├── CustomUserDetailsService
│   │       └── PrincipalDetails
│   └── validation
│       ├── NullOrNotBlank
│       └── NullOrNotBlankValidator
└── domain
    ├── admin
    ├── auth
    ├── user
    ├── profile
    ├── post
    ├── category
    └── tag
```

## 도메인 책임

| 도메인 | 책임 |
| --- | --- |
| `admin` | 관리자용 사용자 조회 API |
| `auth` | 로그인, 토큰 재발급, 로그아웃, Refresh Token 저장 |
| `user` | 회원가입, 사용자 조회, 계정 수정, 비밀번호 변경, 탈퇴 흐름 |
| `profile` | 공개 프로필 조회 및 수정 |
| `post` | 게시글 작성, 목록/상세 조회, 수정, soft delete |
| `category` | 사용자별 카테고리 목록, 생성, 수정, 삭제 |
| `tag` | 사용자별 태그 목록 조회 |

## 전역 영역

`global`은 특정 도메인에 소속되지 않고 애플리케이션 전체에 적용되는 코드를 담습니다.

- `global.config`: Spring Security 등 전역 설정
- `global.exception`: 공통 예외와 에러 코드
- `global.response`: 공통 API 응답 포맷
- `global.security.jwt`: JWT 생성, 검증, 인증 필터
- `global.security.principal`: 인증 사용자 principal 구성
- `global.validation`: 공통 Bean Validation 확장

## 인증 흐름

1. 클라이언트가 `Authorization: Bearer <token>` 헤더를 보냅니다.
2. `JwtAuthenticationFilter`가 토큰을 검증합니다.
3. `JwtProvider`가 사용자 PK를 파싱하고 인증 객체를 생성합니다.
4. 컨트롤러는 `@AuthenticationPrincipal PrincipalDetails`로 로그인 사용자를 받습니다.

인증 헤더가 없으면 필터는 익명 요청으로 통과시킵니다. 보호 API 접근 여부는 `SecurityConfig`의 URL 규칙이 결정합니다. 잘못된 Authorization 헤더나 유효하지 않은 토큰은 401 응답을 반환합니다.

## 응답 포맷

성공:

```json
{
  "code": "SUCCESS",
  "message": "처리 메시지 또는 null",
  "data": {},
  "errors": null
}
```

실패:

```json
{
  "code": "ERROR_CODE",
  "message": "에러 메시지",
  "data": null,
  "errors": []
}
```

삭제 API처럼 HTTP 204를 반환하는 경우에는 응답 본문이 없습니다.

## 주요 설계 메모

- API URL은 재구조화 전후로 유지됩니다.
- 기존 `signup` 패키지는 사용자 계정 전반을 담당하므로 `domain.user`로 정리되었습니다.
- 공개 프로필은 `domain.profile`로 분리되어 `UserService`와 책임이 분리되었습니다.
- 게시글, 카테고리, 태그는 각각 `domain.post`, `domain.category`, `domain.tag`로 분리되었습니다.
- 사용자 탈퇴 시 계정 비활성화, 게시글 soft delete, refresh token 삭제는 `UserDeletionService`가 조율합니다.
- 현재 admin API는 별도 관리자 권한 모델이 없어서 인증 사용자 접근으로 제한됩니다. 관리자 권한 분리는 개선 백로그에서 추적합니다.
