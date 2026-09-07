# Post, Category, Tag 도메인 요약

## 패키지 위치

```text
domain
├── post
│   ├── controller/PostController
│   ├── service/PostService
│   ├── entity/Post
│   ├── repository/PostRepository
│   └── dto
├── category
│   ├── controller/CategoryController
│   ├── service/CategoryService
│   ├── entity/Category
│   ├── repository/CategoryRepository
│   ├── repository/projection
│   └── dto
└── tag
    ├── controller/TagController
    ├── service/TagService
    ├── entity/Tag
    ├── entity/PostTag
    ├── repository/TagRepository
    ├── repository/PostTagRepository
    ├── repository/projection
    └── dto
```

## Post

`Post`는 게시글 본문과 공개 범위, 조회/좋아요 수, soft delete 상태를 관리합니다.

- 작성자: `User`와 N:1
- 카테고리: `Category`와 N:1, 선택 가능
- 삭제 정책: `isDeleted` 기반 soft delete
- 공개 정책:
  - 공개 글은 비로그인 사용자도 조회 가능
  - 비공개 글은 작성자만 조회 가능
  - 타인의 비공개 글 상세 조회는 존재하지 않는 글처럼 404 처리

주요 API:

| Method | URL | 설명 |
| --- | --- | --- |
| POST | `/api/v1/posts` | 게시글 작성 |
| GET | `/api/v1/posts` | 게시글 목록 조회 |
| GET | `/api/v1/posts/{postId}` | 게시글 상세 조회 |
| PATCH | `/api/v1/posts/{postId}` | 게시글 수정 |
| DELETE | `/api/v1/posts/{postId}` | 게시글 soft delete |

## Category

`Category`는 사용자별 개인 카테고리입니다.

- 동일 사용자 안에서 카테고리 이름은 유니크합니다.
- 카테고리 목록은 커서 기반 페이징을 사용합니다.
- 목록 응답에는 카테고리별 게시글 수와 최신 썸네일이 포함됩니다.
- 카테고리 삭제 시 해당 카테고리를 사용하던 게시글의 카테고리 연결을 해제합니다.

주요 API:

| Method | URL | 설명 |
| --- | --- | --- |
| GET | `/api/v1/users/{userId}/categories` | 카테고리 목록 조회 |
| POST | `/api/v1/users/{userId}/categories` | 카테고리 생성 |
| PATCH | `/api/v1/users/{userId}/categories/{categoryId}` | 카테고리 수정 |
| DELETE | `/api/v1/users/{userId}/categories/{categoryId}` | 카테고리 삭제 |

## Tag

`Tag`는 게시글과 `PostTag`로 연결됩니다.

- `PostTag`는 `User`, `Post`, `Tag`를 연결합니다.
- 태그 목록은 커서 기반 페이징을 사용합니다.
- 목록 응답에는 태그별 게시글 수와 최신 썸네일이 포함됩니다.

주요 API:

| Method | URL | 설명 |
| --- | --- | --- |
| GET | `/api/v1/tags?userId={userId}` | 태그 목록 조회 |

## 조회 정책과 페이징

### Post

- 목록 조회의 `type`은 `latest`, `trending`을 지원합니다.
- 지원하지 않는 `type` 값은 `latest`로 처리합니다.
- 비로그인 사용자는 공개 글만 조회합니다.
- 로그인 사용자는 공개 글과 본인 비공개 글을 조회합니다.

### Category

- `limit` 기본값은 10이고 최대 50으로 제한합니다.
- `cursor`는 양수만 허용합니다.
- 현재 구현은 `id DESC` 기준으로 페이지를 가져오며, 다음 요청에는 응답의 `nextCursor`를 전달합니다.
- 목록 응답에는 `content`, `hasNext`, `nextCursor`가 포함됩니다.

### Tag

- `limit` 기본값은 10이고 최대 50으로 제한합니다.
- `cursor`는 양수만 허용합니다.
- 현재 구현은 `tag.id ASC` 기준으로 페이지를 가져오며, 다음 요청에는 응답의 `nextCursor`를 전달합니다.
- 목록 응답에는 `content`, `hasNext`, `hasLast`, `nextCursor`가 포함됩니다.

## 관련 SQL

`src/main/resources/sql`에는 현재 기준 스키마 스냅샷과 초기 데이터 파일만 둡니다.

- `schema.sql`: 현재 엔티티 기준 전체 테이블 구조 참고용 스키마
- `data.sql`: 초기 데이터가 필요할 때 사용하는 파일

현재 애플리케이션은 JPA `ddl-auto` 설정으로 스키마를 관리하며, 운영 프로필에서는 `spring.sql.init.mode: never`로 SQL 초기화를 비활성화합니다.
