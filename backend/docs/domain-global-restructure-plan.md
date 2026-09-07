# Domain + Global 패키지 재구조화 계획

상태: 완료된 재구조화 이력 문서입니다. 현재 코드 기준 구조는 이미 `global`과 `domain` 중심으로 정리되어 있으며, 최신 API와 응답 포맷은 `README.md`, `docs/backend-summary.md`, `docs/post-module-summary.md`를 기준으로 봅니다.

## 목표

백엔드 패키지 구조를 `global`과 `domain` 중심으로 재정리한다.

- `global`: 애플리케이션 전체에 공통으로 적용되는 설정, 보안, 예외, 응답, 검증
- `domain`: 실제 비즈니스 기능 단위의 도메인 코드

이 계획에서는 API URL을 변경하지 않는다. 각 단계는 작게 나누고, 단계마다 `sh gradlew test`로 검증한다.

## 목표 구조

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

## 작업 원칙

- API URL 매핑은 바꾸지 않는다.
- 한 번에 하나의 경계만 이동한다.
- Java 파일을 이동할 때는 반드시 아래 두 가지를 함께 수정한다.
  - `package ...;`
  - 해당 패키지를 참조하는 모든 import
- 각 Phase가 끝날 때마다 테스트를 실행한다.

```bash
sh gradlew test
```

- 테스트가 통과한 Phase만 커밋한다.
- 명시된 단계가 아니라면 패키지 이동과 기능 변경을 섞지 않는다.

## 현재 기준 상태

현재 주요 패키지:

```text
com.example.atlex.global
com.example.atlex.domain.admin
com.example.atlex.domain.auth
com.example.atlex.domain.user
com.example.atlex.domain.profile
com.example.atlex.domain.post
com.example.atlex.domain.category
com.example.atlex.domain.tag
```

재구조화 이전 주요 패키지:

```text
com.example.atlex.auth
com.example.atlex.signup
com.example.atlex.post
com.example.atlex.global
```

재구조화 이전 구조의 문제:

- `signup`은 더 이상 회원가입만 담당하지 않는다. 사용자 계정, 프로필, 비밀번호 변경, 탈퇴까지 포함하고 있다.
- `post` 안에 게시글, 카테고리, 태그, 게시글-태그 연결 책임이 함께 들어 있다.
- `global_common`은 새 구조 기준으로 `global`이 더 적합하다.
- 기존 문서는 실제 코드와 어긋난 부분이 있을 수 있다.

테스트 기준 명령:

```bash
sh gradlew test
```

## Phase 0: 브랜치 생성 및 기준선 확인

브랜치를 생성한다.

```bash
git switch -c refactor/domain-global-structure
```

기준 테스트를 실행한다.

```bash
sh gradlew test
```

기대 결과:

```text
BUILD SUCCESSFUL
```

이 단계에서 설정이나 문서를 변경하지 않았다면 커밋은 생략해도 된다.

## Phase 1: `global_common`을 `global`로 이동

먼저 공통 인프라 패키지만 정리한다. 이 단계에서는 도메인 코드를 이동하지 않는다.

이동 대상:

```text
src/main/java/com/example/atlex/global_common/config
-> src/main/java/com/example/atlex/global/config

src/main/java/com/example/atlex/global_common/exception
-> src/main/java/com/example/atlex/global/exception

src/main/java/com/example/atlex/global_common/response
-> src/main/java/com/example/atlex/global/response

src/main/java/com/example/atlex/global_common/validation
-> src/main/java/com/example/atlex/global/validation
```

보안 관련 클래스 이동:

```text
src/main/java/com/example/atlex/global_common/jwt/JwtProvider.java
-> src/main/java/com/example/atlex/global/security/jwt/JwtProvider.java

src/main/java/com/example/atlex/global_common/jwt/JwtAuthenticationFilter.java
-> src/main/java/com/example/atlex/global/security/jwt/JwtAuthenticationFilter.java

src/main/java/com/example/atlex/global_common/security/PrincipalDetails.java
-> src/main/java/com/example/atlex/global/security/principal/PrincipalDetails.java

src/main/java/com/example/atlex/global_common/security/CustomUserDetailsService.java
-> src/main/java/com/example/atlex/global/security/principal/CustomUserDetailsService.java
```

package 선언을 변경한다.

```java
package com.example.atlex.global...
package com.example.atlex.global.security.jwt;
package com.example.atlex.global.security.principal;
```

import를 변경한다.

```text
com.example.atlex.global...
-> com.example.atlex.global...
```

검증:

```bash
sh gradlew test
```

커밋:

```bash
git add src
git commit -m "refactor: move shared infrastructure under global package"
```

## Phase 2: `signup`을 `domain.user`로 이동

사용자 계정 도메인의 이름을 정리한다. 이 단계에서는 아직 프로필을 분리하지 않는다.

이동 대상:

```text
src/main/java/com/example/atlex/signup/controller/UserController.java
-> src/main/java/com/example/atlex/domain/user/controller/UserController.java

src/main/java/com/example/atlex/signup/service/UserService.java
-> src/main/java/com/example/atlex/domain/user/service/UserService.java

src/main/java/com/example/atlex/signup/entity/User.java
-> src/main/java/com/example/atlex/domain/user/entity/User.java

src/main/java/com/example/atlex/signup/repository/UserRepository.java
-> src/main/java/com/example/atlex/domain/user/repository/UserRepository.java

src/main/java/com/example/atlex/signup/dto/request/SignupRequest.java
-> src/main/java/com/example/atlex/domain/user/dto/request/SignupRequest.java

src/main/java/com/example/atlex/signup/dto/request/UpdateRequest.java
-> src/main/java/com/example/atlex/domain/user/dto/request/UpdateRequest.java

src/main/java/com/example/atlex/signup/dto/request/EmailCheckRequest.java
-> src/main/java/com/example/atlex/domain/user/dto/request/EmailCheckRequest.java

src/main/java/com/example/atlex/signup/dto/request/ChangePasswordRequest.java
-> src/main/java/com/example/atlex/domain/user/dto/request/ChangePasswordRequest.java

src/main/java/com/example/atlex/signup/dto/response/UserResponse.java
-> src/main/java/com/example/atlex/domain/user/dto/response/UserResponse.java
```

아래 파일은 Phase 3에서 이동한다.

```text
ProfileController
ProfileUpdateRequest
PublicUserResponse
```

import를 변경한다.

```text
com.example.atlex.signup...
-> com.example.atlex.domain.user...
```

검증:

```bash
sh gradlew test
```

커밋:

```bash
git add src
git commit -m "refactor: move signup package to user domain"
```

## Phase 3: `domain.profile` 분리

공개 프로필 관련 기능을 사용자 계정 관리와 분리한다.

이동 대상:

```text
src/main/java/com/example/atlex/signup/controller/ProfileController.java
-> src/main/java/com/example/atlex/domain/profile/controller/ProfileController.java

src/main/java/com/example/atlex/signup/dto/request/ProfileUpdateRequest.java
-> src/main/java/com/example/atlex/domain/profile/dto/request/ProfileUpdateRequest.java

src/main/java/com/example/atlex/signup/dto/response/PublicUserResponse.java
-> src/main/java/com/example/atlex/domain/profile/dto/response/PublicUserResponse.java
```

새 파일 생성:

```text
src/main/java/com/example/atlex/domain/profile/service/ProfileService.java
```

`UserService`에서 아래 메서드를 `ProfileService`로 이동한다.

```java
getPublicProfile(String userId)
updatePublicProfile(String userId, ProfileUpdateRequest request, User loginUser)
```

`ProfileService`의 의존성:

```java
UserRepository
```

`ProfileController`의 의존성:

```java
ProfileService
```

검증:

```bash
sh gradlew test
```

커밋:

```bash
git add src
git commit -m "refactor: extract profile domain"
```

## Phase 4: `auth`를 `domain.auth`로 이동

인증 도메인을 `domain` 아래로 이동한다.

이동 대상:

```text
src/main/java/com/example/atlex/auth/controller
-> src/main/java/com/example/atlex/domain/auth/controller

src/main/java/com/example/atlex/auth/service
-> src/main/java/com/example/atlex/domain/auth/service

src/main/java/com/example/atlex/auth/entity
-> src/main/java/com/example/atlex/domain/auth/entity

src/main/java/com/example/atlex/auth/repository
-> src/main/java/com/example/atlex/domain/auth/repository

src/main/java/com/example/atlex/auth/dto
-> src/main/java/com/example/atlex/domain/auth/dto
```

참조를 새 구조에 맞게 변경한다.

```text
com.example.atlex.domain.auth...
com.example.atlex.domain.user...
com.example.atlex.global...
```

검증:

```bash
sh gradlew test
```

커밋:

```bash
git add src
git commit -m "refactor: move auth under domain package"
```

## Phase 5: 게시글 핵심 코드를 `domain.post`로 이동

먼저 게시글 전용 코드만 이동한다. 카테고리와 태그는 다음 단계에서 분리한다.

이동 대상:

```text
src/main/java/com/example/atlex/post/controller/PostController.java
-> src/main/java/com/example/atlex/domain/post/controller/PostController.java

src/main/java/com/example/atlex/post/service/PostService.java
-> src/main/java/com/example/atlex/domain/post/service/PostService.java

src/main/java/com/example/atlex/post/entity/Post.java
-> src/main/java/com/example/atlex/domain/post/entity/Post.java

src/main/java/com/example/atlex/post/repository/PostRepository.java
-> src/main/java/com/example/atlex/domain/post/repository/PostRepository.java

src/main/java/com/example/atlex/post/dto/request/PostCreateRequest.java
-> src/main/java/com/example/atlex/domain/post/dto/request/PostCreateRequest.java

src/main/java/com/example/atlex/post/dto/request/PostUpdateRequest.java
-> src/main/java/com/example/atlex/domain/post/dto/request/PostUpdateRequest.java

src/main/java/com/example/atlex/post/dto/response/PostResponse.java
-> src/main/java/com/example/atlex/domain/post/dto/response/PostResponse.java

src/main/java/com/example/atlex/post/dto/response/PostSummaryResponse.java
-> src/main/java/com/example/atlex/domain/post/dto/response/PostSummaryResponse.java
```

이 단계에서는 아래 의존성이 임시로 남아도 된다.

```text
domain.post -> 기존 category/tag 관련 클래스
```

카테고리와 태그는 Phase 6, Phase 7에서 분리한다.

검증:

```bash
sh gradlew test
```

커밋:

```bash
git add src
git commit -m "refactor: move post domain package"
```

## Phase 6: `domain.category` 분리

카테고리 관련 코드를 `domain.category`로 분리한다.

이동 대상:

```text
src/main/java/com/example/atlex/post/controller/CategoryController.java
-> src/main/java/com/example/atlex/domain/category/controller/CategoryController.java

src/main/java/com/example/atlex/post/service/CategoryService.java
-> src/main/java/com/example/atlex/domain/category/service/CategoryService.java

src/main/java/com/example/atlex/post/entity/Category.java
-> src/main/java/com/example/atlex/domain/category/entity/Category.java

src/main/java/com/example/atlex/post/repository/CategoryRepository.java
-> src/main/java/com/example/atlex/domain/category/repository/CategoryRepository.java

src/main/java/com/example/atlex/post/dto/request/CategoryCreateRequest.java
-> src/main/java/com/example/atlex/domain/category/dto/request/CategoryCreateRequest.java

src/main/java/com/example/atlex/post/dto/request/CategoryUpdateRequest.java
-> src/main/java/com/example/atlex/domain/category/dto/request/CategoryUpdateRequest.java

src/main/java/com/example/atlex/post/dto/response/CategoryResponse.java
-> src/main/java/com/example/atlex/domain/category/dto/response/CategoryResponse.java

src/main/java/com/example/atlex/post/dto/response/CategoryListResponse.java
-> src/main/java/com/example/atlex/domain/category/dto/response/CategoryListResponse.java

src/main/java/com/example/atlex/post/dto/response/CategoryListItemResponse.java
-> src/main/java/com/example/atlex/domain/category/dto/response/CategoryListItemResponse.java

src/main/java/com/example/atlex/post/repository/projection/CategoryPostCountProjection.java
-> src/main/java/com/example/atlex/domain/category/repository/projection/CategoryPostCountProjection.java

src/main/java/com/example/atlex/post/repository/projection/CategoryThumbnailProjection.java
-> src/main/java/com/example/atlex/domain/category/repository/projection/CategoryThumbnailProjection.java
```

수정 포인트:

```text
Post.java -> domain.category.entity.Category import
PostService.java -> domain.category.repository.CategoryRepository import
PostRepository.java -> category projection import
CategoryService.java -> domain.post.repository.PostRepository import
```

검증:

```bash
sh gradlew test
```

커밋:

```bash
git add src
git commit -m "refactor: extract category domain"
```

## Phase 7: `domain.tag` 분리

태그와 게시글-태그 연결 코드를 `domain.tag`로 분리한다.

이동 대상:

```text
src/main/java/com/example/atlex/post/controller/TagController.java
-> src/main/java/com/example/atlex/domain/tag/controller/TagController.java

src/main/java/com/example/atlex/post/service/TagService.java
-> src/main/java/com/example/atlex/domain/tag/service/TagService.java

src/main/java/com/example/atlex/post/entity/Tag.java
-> src/main/java/com/example/atlex/domain/tag/entity/Tag.java

src/main/java/com/example/atlex/post/entity/PostTag.java
-> src/main/java/com/example/atlex/domain/tag/entity/PostTag.java

src/main/java/com/example/atlex/post/repository/TagRepository.java
-> src/main/java/com/example/atlex/domain/tag/repository/TagRepository.java

src/main/java/com/example/atlex/post/repository/PostTagRepository.java
-> src/main/java/com/example/atlex/domain/tag/repository/PostTagRepository.java

src/main/java/com/example/atlex/post/dto/response/TagListResponse.java
-> src/main/java/com/example/atlex/domain/tag/dto/response/TagListResponse.java

src/main/java/com/example/atlex/post/dto/response/TagListItemResponse.java
-> src/main/java/com/example/atlex/domain/tag/dto/response/TagListItemResponse.java

src/main/java/com/example/atlex/post/repository/projection/TagPostCountProjection.java
-> src/main/java/com/example/atlex/domain/tag/repository/projection/TagPostCountProjection.java

src/main/java/com/example/atlex/post/repository/projection/TagThumbnailProjection.java
-> src/main/java/com/example/atlex/domain/tag/repository/projection/TagThumbnailProjection.java
```

수정 포인트:

```text
PostTag.java -> domain.post.entity.Post import
PostTag.java -> domain.tag.entity.Tag import
PostTag.java -> domain.user.entity.User import
TagService.java -> domain.tag.repository.PostTagRepository import
```

검증:

```bash
sh gradlew test
```

커밋:

```bash
git add src
git commit -m "refactor: extract tag domain"
```

## Phase 8: 사용자 탈퇴 흐름 분리

현재 `UserService.delete()`는 아래 작업을 직접 조율한다.

- 사용자 비활성화
- 해당 사용자의 게시글 soft delete
- refresh token 삭제

새 파일을 생성한다.

```text
src/main/java/com/example/atlex/domain/user/service/UserDeletionService.java
```

탈퇴 오케스트레이션 로직을 `UserDeletionService`로 이동한다.

`UserDeletionService`의 의존성:

```java
UserRepository
PostRepository
RefreshTokenRepository
```

`UserController`는 아래처럼 `UserDeletionService`를 호출한다.

```java
userDeletionService.delete(userId);
```

`UserService`는 아래 책임에 집중한다.

- 회원가입
- 사용자 조회
- 이메일 중복 확인
- 사용자 정보 수정
- 비밀번호 변경

검증:

```bash
sh gradlew test
```

커밋:

```bash
git add src
git commit -m "refactor: isolate user deletion workflow"
```

## Phase 9: 테스트 패키지 정리

테스트 패키지도 새 도메인 구조에 맞춘다.

이동 대상:

```text
src/test/java/com/example/atlex/signup/ProfileControllerTest.java
-> src/test/java/com/example/atlex/domain/profile/ProfileControllerTest.java

src/test/java/com/example/atlex/post/PostControllerTest.java
-> src/test/java/com/example/atlex/domain/post/PostControllerTest.java

src/test/java/com/example/atlex/post/PostServiceTest.java
-> src/test/java/com/example/atlex/domain/post/PostServiceTest.java

src/test/java/com/example/atlex/post/CategoryControllerTest.java
-> src/test/java/com/example/atlex/domain/category/CategoryControllerTest.java

src/test/java/com/example/atlex/post/TagControllerTest.java
-> src/test/java/com/example/atlex/domain/tag/TagControllerTest.java
```

package 선언을 변경한다.

```java
package com.example.atlex.domain.profile;
package com.example.atlex.domain.post;
package com.example.atlex.domain.category;
package com.example.atlex.domain.tag;
```

검증:

```bash
sh gradlew test
```

커밋:

```bash
git add src/test
git commit -m "refactor: align tests with domain package structure"
```

## Phase 10: 문서 갱신

코드 구조가 안정된 뒤 문서를 갱신한다.

권장 수정 파일:

```text
README.md
docs/backend-summary.md
docs/post-module-summary.md
```

문서에 반영할 내용:

- `global`은 애플리케이션 전체 공통 관심사를 담는다.
- `domain`은 비즈니스 도메인을 담는다.
- 기존 `signup` 패키지는 `domain.user`로 변경되었다.
- profile은 user에서 분리되었다.
- post, category, tag는 별도 도메인으로 분리되었다.
- API URL은 변경되지 않았다.
- Spring Security JWT 필터 체인은 구현되어 있다.

검증:

```bash
sh gradlew test
```

커밋:

```bash
git add README.md docs
git commit -m "docs: update backend structure documentation"
```

## 최종 검증

실행:

```bash
sh gradlew test
git status --short
```

기대 결과:

```text
BUILD SUCCESSFUL
```

최종 패키지 트리 확인:

```bash
find src/main/java/com/example/atlex -type d | sort
```

기존 패키지명이 남아 있는지 확인:

```bash
rg "com\.example\.atlex\.global_common|com\.example\.atlex\.signup|package com\.example\.atlex\.post" src/main/java src/test/java
```

기대 결과:

```text
no matches
```

## 위험 구간

- Phase 6과 Phase 7이 가장 실수하기 쉽다.
- 이유는 `Post`, `Category`, `Tag`, `PostTag`가 JPA 연관관계로 연결되어 있기 때문이다.
- 특정 Phase 이후 테스트가 실패하면 다음 Phase로 넘어가지 말고 해당 Phase 안에서 해결한다.
- 이 리팩토링 중에는 테이블명, endpoint path, DTO 필드명, 응답 형식을 변경하지 않는다.
- 패키지 이동만으로는 DB 마이그레이션 변경이 필요하지 않아야 한다.
