package com.example.atlex.domain.post;

import com.example.atlex.global.security.jwt.JwtProvider;
import com.example.atlex.domain.category.entity.Category;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.category.repository.CategoryRepository;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.nullValue;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.MOCK,
    properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.jpa.hibernate.ddl-auto=create-drop"
    }
)
@Transactional
class PostControllerTest {

    @Autowired WebApplicationContext context;
    @Autowired JwtProvider jwtProvider;
    @Autowired UserRepository userRepository;
    @Autowired PostRepository postRepository;
    @Autowired CategoryRepository categoryRepository;

    private MockMvc mockMvc;

    // JwtProvider 와 동일한 시크릿 키 — 만료 토큰 생성 전용
    private static final Key TEST_KEY = Keys.hmacShaKeyFor(
        "djksdjl23423213njn23jdsadnakjfnej_atlex_2026".getBytes(StandardCharsets.UTF_8)
    );

    private Long publicPostId;
    private Long privatePostId;
    private Long authorDbId;
    private String authorToken;
    private String otherToken;
    private User author;
    private User other;
    private Category category;
    private Category otherCategory;
    private Category categoryOwnedByOther;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
            .apply(SecurityMockMvcConfigurers.springSecurity())
            .build();

        author = userRepository.saveAndFlush(User.builder()
            .userId("author")
            .email("author@test.com")
            .password("pw")
            .name("작성자")
            .active(true)
            .build());

        other = userRepository.saveAndFlush(User.builder()
            .userId("other")
            .email("other@test.com")
            .password("pw")
            .name("타인")
            .active(true)
            .build());

        category = categoryRepository.saveAndFlush(Category.builder()
            .user(author)
            .name("개발")
            .build());
        otherCategory = categoryRepository.saveAndFlush(Category.builder()
            .user(author)
            .name("일상")
            .build());
        categoryOwnedByOther = categoryRepository.saveAndFlush(Category.builder()
            .user(other)
            .name("타인 카테고리")
            .build());

        publicPostId = postRepository.saveAndFlush(Post.builder()
            .user(author)
            .category(category)
            .title("공개글")
            .description("공개 설명")
            .content("공개 내용")
            .thumbnailUrl("https://example.com/public.png")
            .isPublic(true)
            .build()).getId();

        privatePostId = postRepository.saveAndFlush(Post.builder()
            .user(author)
            .category(category)
            .title("비공개글")
            .content("비공개 내용")
            .isPublic(false)
            .build()).getId();

        authorDbId  = author.getId();
        authorToken = jwtProvider.createAccessToken(authorDbId);
        otherToken  = jwtProvider.createAccessToken(other.getId());
    }

    // ────────────────────────── 목록 조회 ──────────────────────────

    @Test @DisplayName("비로그인 목록 조회 → 200")
    void getList_anonymous() throws Exception {
        mockMvc.perform(get("/api/v1/posts"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalElements").value(1))
            .andExpect(jsonPath("$.data.content[0].id").value(publicPostId));
    }

    @Test @DisplayName("로그인 목록 조회 → 공개 글과 본인 비공개 글 조회")
    void getList_author_includesOwnPrivatePost() throws Exception {
        mockMvc.perform(get("/api/v1/posts")
                .header("Authorization", "Bearer " + authorToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalElements").value(2));
    }

    @Test @DisplayName("로그인 목록 조회 → 타인 비공개 글 제외")
    void getList_other_excludesPrivatePost() throws Exception {
        mockMvc.perform(get("/api/v1/posts")
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalElements").value(1))
            .andExpect(jsonPath("$.data.content[0].id").value(publicPostId));
    }

    @Test @DisplayName("userId 필터는 해당 작성자의 글만 조회")
    void getList_filterByUserId() throws Exception {
        savePublicPost(other, category, "타인 공개글");

        mockMvc.perform(get("/api/v1/posts")
                .param("userId", "author"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalElements").value(1))
            .andExpect(jsonPath("$.data.content[0].authorUserId").value("author"));
    }

    @Test @DisplayName("비로그인 userId 필터는 작성자의 공개 글만 조회")
    void getList_anonymousUserFilter_excludesPrivatePost() throws Exception {
        mockMvc.perform(get("/api/v1/posts")
                .param("userId", "author"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalElements").value(1))
            .andExpect(jsonPath("$.data.content[0].id").value(publicPostId));
    }

    @Test @DisplayName("작성자 로그인 userId 필터는 본인 공개 글과 비공개 글 조회")
    void getList_authorUserFilter_includesOwnPrivatePost() throws Exception {
        mockMvc.perform(get("/api/v1/posts")
                .param("userId", "author")
                .header("Authorization", "Bearer " + authorToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalElements").value(2));
    }

    @Test @DisplayName("다른 사용자 로그인 userId 필터는 작성자의 비공개 글 제외")
    void getList_otherUserFilter_excludesPrivatePost() throws Exception {
        mockMvc.perform(get("/api/v1/posts")
                .param("userId", "author")
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalElements").value(1))
            .andExpect(jsonPath("$.data.content[0].id").value(publicPostId));
    }

    @Test @DisplayName("categoryId 필터는 해당 카테고리 글만 조회")
    void getList_filterByCategoryId() throws Exception {
        savePublicPost(author, otherCategory, "일상글");

        mockMvc.perform(get("/api/v1/posts")
                .param("categoryId", category.getId().toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalElements").value(1))
            .andExpect(jsonPath("$.data.content[0].categoryId").value(category.getId()))
            .andExpect(jsonPath("$.data.content[0].categoryName").value("개발"));
    }

    @Test @DisplayName("userId와 categoryId 필터를 함께 적용")
    void getList_filterByUserIdAndCategoryId() throws Exception {
        savePublicPost(other, category, "타인 개발글");
        savePublicPost(author, otherCategory, "작성자 일상글");

        mockMvc.perform(get("/api/v1/posts")
                .param("userId", "author")
                .param("categoryId", category.getId().toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalElements").value(1))
            .andExpect(jsonPath("$.data.content[0].id").value(publicPostId))
            .andExpect(jsonPath("$.data.content[0].authorUserId").value("author"))
            .andExpect(jsonPath("$.data.content[0].categoryId").value(category.getId()));
    }

    @Test @DisplayName("카테고리가 없는 게시글은 카테고리 응답 필드가 null")
    void getList_withoutCategory_returnsNullCategoryFields() throws Exception {
        savePublicPost(other, null, "카테고리 없는 글");

        mockMvc.perform(get("/api/v1/posts")
                .param("userId", "other"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalElements").value(1))
            .andExpect(jsonPath("$.data.content[0].categoryId").value(nullValue()))
            .andExpect(jsonPath("$.data.content[0].categoryName").value(nullValue()));
    }

    // ────────────────────────── 단건 조회 ──────────────────────────

    @Test @DisplayName("비로그인 + 공개 글 단건 조회 → 200")
    void getOne_anonymous_public() throws Exception {
        mockMvc.perform(get("/api/v1/posts/{id}", publicPostId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.description").value("공개 설명"))
            .andExpect(jsonPath("$.data.thumbnailUrl").value("https://example.com/public.png"));
    }

    @Test
    @DisplayName("상세 조회는 description fallback 없이 원본 null을 유지한다")
    void getOne_nullDescriptionDoesNotUseContentFallback() throws Exception {
        Long postId = savePublicPost(author, category, "description 없는 글");

        mockMvc.perform(get("/api/v1/posts/{id}", postId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.description").value(nullValue()));
    }

    @Test @DisplayName("비로그인 + 비공개 글 단건 조회 → 404")
    void getOne_anonymous_private() throws Exception {
        mockMvc.perform(get("/api/v1/posts/{id}", privatePostId))
            .andExpect(status().isNotFound());
    }

    @Test @DisplayName("로그인 + 본인 비공개 글 조회 → 200")
    void getOne_author_ownPrivate() throws Exception {
        mockMvc.perform(get("/api/v1/posts/{id}", privatePostId)
                .header("Authorization", "Bearer " + authorToken))
            .andExpect(status().isOk());
    }

    @Test @DisplayName("로그인 + 남의 비공개 글 조회 → 404")
    void getOne_other_privatePost() throws Exception {
        mockMvc.perform(get("/api/v1/posts/{id}", privatePostId)
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isNotFound());
    }

    // ────────────────────────── 작성 ──────────────────────────

    @Test @DisplayName("비로그인 POST → 401")
    void create_anonymous() throws Exception {
        mockMvc.perform(post("/api/v1/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"t\",\"content\":\"c\"}"))
            .andExpect(status().isUnauthorized());
    }

    @Test @DisplayName("게시글 작성 시 description과 thumbnailUrl 응답")
    void create_withDescriptionAndThumbnail() throws Exception {
        mockMvc.perform(post("/api/v1/posts")
                .header("Authorization", "Bearer " + authorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "title": "필드 포함 글",
                      "description": "게시글 설명",
                      "content": "게시글 본문",
                      "thumbnailUrl": "https://example.com/image.png",
                      "isPublic": true
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.description").value("게시글 설명"))
            .andExpect(jsonPath("$.data.thumbnailUrl").value("https://example.com/image.png"));
    }

    @Test @DisplayName("게시글 작성 시 description 255자 초과 -> 400")
    void create_descriptionTooLong() throws Exception {
        String longDescription = "a".repeat(256);

        mockMvc.perform(post("/api/v1/posts")
                .header("Authorization", "Bearer " + authorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "title": "길이 검증",
                      "description": "%s",
                      "content": "본문"
                    }
                    """.formatted(longDescription)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errors[0].data.key").value("description"));
    }

    @Test @DisplayName("게시글 작성 시 thumbnailUrl 255자 초과 -> 400")
    void create_thumbnailUrlTooLong() throws Exception {
        String longThumbnailUrl = "a".repeat(256);

        mockMvc.perform(post("/api/v1/posts")
                .header("Authorization", "Bearer " + authorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "title": "길이 검증",
                      "content": "본문",
                      "thumbnailUrl": "%s"
                    }
                    """.formatted(longThumbnailUrl)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errors[0].data.key").value("thumbnailUrl"));
    }

    @Test @DisplayName("description과 thumbnailUrl 없이도 게시글 작성")
    void create_withoutDescriptionAndThumbnail() throws Exception {
        mockMvc.perform(post("/api/v1/posts")
                .header("Authorization", "Bearer " + authorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"기존 형식 글\",\"content\":\"게시글 본문\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.description").isEmpty())
            .andExpect(jsonPath("$.data.thumbnailUrl").isEmpty());
    }

    @Test @DisplayName("게시글 작성 시 본인 카테고리를 사용할 수 있다")
    void create_withOwnCategory() throws Exception {
        mockMvc.perform(post("/api/v1/posts")
                .header("Authorization", "Bearer " + authorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "title": "본인 카테고리 글",
                      "content": "본문",
                      "categoryId": %d
                    }
                    """.formatted(category.getId())))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.categoryId").value(category.getId()));
    }

    @Test @DisplayName("게시글 작성 시 타인 카테고리는 사용할 수 없다")
    void create_withOtherUsersCategory() throws Exception {
        mockMvc.perform(post("/api/v1/posts")
                .header("Authorization", "Bearer " + authorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "title": "타인 카테고리 글",
                      "content": "본문",
                      "categoryId": %d
                    }
                    """.formatted(categoryOwnedByOther.getId())))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("CATEGORY_NOT_FOUND"));
    }

    // ────────────────────────── 수정 ──────────────────────────

    @Test @DisplayName("비로그인 PATCH → 401")
    void update_anonymous() throws Exception {
        mockMvc.perform(patch("/api/v1/posts/{id}", publicPostId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"updated\"}"))
            .andExpect(status().isUnauthorized());
    }

    @Test @DisplayName("로그인 + 남의 글 PATCH → 403")
    void update_other() throws Exception {
        mockMvc.perform(patch("/api/v1/posts/{id}", publicPostId)
                .header("Authorization", "Bearer " + otherToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"updated\"}"))
            .andExpect(status().isForbidden());
    }

    @Test @DisplayName("로그인 + 본인 글 PATCH → 200")
    void update_author() throws Exception {
        mockMvc.perform(patch("/api/v1/posts/{id}", publicPostId)
                .header("Authorization", "Bearer " + authorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"updated\"}"))
            .andExpect(status().isOk());
    }

    @Test @DisplayName("게시글 수정 시 description과 thumbnailUrl 변경")
    void update_descriptionAndThumbnail() throws Exception {
        mockMvc.perform(patch("/api/v1/posts/{id}", publicPostId)
                .header("Authorization", "Bearer " + authorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "description": "수정된 설명",
                      "thumbnailUrl": "https://example.com/updated.png"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.description").value("수정된 설명"))
            .andExpect(jsonPath("$.data.thumbnailUrl").value("https://example.com/updated.png"));
    }

    @Test @DisplayName("게시글 수정 시 description 255자 초과 -> 400")
    void update_descriptionTooLong() throws Exception {
        String longDescription = "a".repeat(256);

        mockMvc.perform(patch("/api/v1/posts/{id}", publicPostId)
                .header("Authorization", "Bearer " + authorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"description\":\"" + longDescription + "\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errors[0].data.key").value("description"));
    }

    @Test @DisplayName("게시글 수정 시 thumbnailUrl 255자 초과 -> 400")
    void update_thumbnailUrlTooLong() throws Exception {
        String longThumbnailUrl = "a".repeat(256);

        mockMvc.perform(patch("/api/v1/posts/{id}", publicPostId)
                .header("Authorization", "Bearer " + authorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"thumbnailUrl\":\"" + longThumbnailUrl + "\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errors[0].data.key").value("thumbnailUrl"));
    }

    @Test @DisplayName("게시글 수정 시 본인 카테고리로 변경할 수 있다")
    void update_withOwnCategory() throws Exception {
        mockMvc.perform(patch("/api/v1/posts/{id}", publicPostId)
                .header("Authorization", "Bearer " + authorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"categoryId\":" + otherCategory.getId() + "}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.categoryId").value(otherCategory.getId()));
    }

    @Test @DisplayName("게시글 수정 시 타인 카테고리는 사용할 수 없다")
    void update_withOtherUsersCategory() throws Exception {
        mockMvc.perform(patch("/api/v1/posts/{id}", publicPostId)
                .header("Authorization", "Bearer " + authorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"categoryId\":" + categoryOwnedByOther.getId() + "}"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("CATEGORY_NOT_FOUND"));
    }

    @Test @DisplayName("로그인 + 없는 글 PATCH → 404")
    void update_notFound() throws Exception {
        mockMvc.perform(patch("/api/v1/posts/{id}", 999999L)
                .header("Authorization", "Bearer " + authorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"updated\"}"))
            .andExpect(status().isNotFound());
    }

    // ────────────────────────── 삭제 ──────────────────────────

    @Test @DisplayName("비로그인 DELETE → 401")
    void delete_anonymous() throws Exception {
        mockMvc.perform(delete("/api/v1/posts/{id}", publicPostId))
            .andExpect(status().isUnauthorized());
    }

    @Test @DisplayName("로그인 + 남의 글 DELETE → 403")
    void delete_other() throws Exception {
        mockMvc.perform(delete("/api/v1/posts/{id}", publicPostId)
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isForbidden());
    }

    @Test @DisplayName("로그인 + 본인 글 DELETE → 204")
    void delete_author() throws Exception {
        mockMvc.perform(delete("/api/v1/posts/{id}", publicPostId)
                .header("Authorization", "Bearer " + authorToken))
            .andExpect(status().isNoContent());
    }

    @Test @DisplayName("로그인 + 없는 글 DELETE → 404")
    void delete_notFound() throws Exception {
        mockMvc.perform(delete("/api/v1/posts/{id}", 999999L)
                .header("Authorization", "Bearer " + authorToken))
            .andExpect(status().isNotFound());
    }

    // ────────────────────────── 작성자 응답 필드 검증 ──────────────────────────

    @Test @DisplayName("게시글 상세 응답 — authorId(Long), authorUserId(String), authorName, authorProfileId 없음")
    void getOne_authorFields() throws Exception {
        mockMvc.perform(get("/api/v1/posts/{id}", publicPostId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.authorId").value(authorDbId))
            .andExpect(jsonPath("$.data.authorUserId").value("author"))
            .andExpect(jsonPath("$.data.authorName").value("작성자"))
            .andExpect(jsonPath("$.data.authorProfileId").doesNotExist());
    }

    @Test @DisplayName("게시글 목록 응답 — authorId(Long), authorUserId(String), authorName, authorProfileId 없음")
    void getList_authorFields() throws Exception {
        mockMvc.perform(get("/api/v1/posts"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content[0].categoryId").value(category.getId()))
            .andExpect(jsonPath("$.data.content[0].categoryName").value("개발"))
            .andExpect(jsonPath("$.data.content[0].description").value("공개 설명"))
            .andExpect(jsonPath("$.data.content[0].thumbnailUrl").value("https://example.com/public.png"))
            .andExpect(jsonPath("$.data.content[0].authorId").value(authorDbId))
            .andExpect(jsonPath("$.data.content[0].authorUserId").value("author"))
            .andExpect(jsonPath("$.data.content[0].authorName").value("작성자"))
            .andExpect(jsonPath("$.data.content[0].authorProfileId").doesNotExist());
    }

    // 수정 후
    @Test @DisplayName("게시글 상세 authorUserId로 공개 프로필 조회 → 200")
    void getProfile_via_authorUserId() throws Exception {
        mockMvc.perform(get("/api/v1/profiles/{userId}", "author"))
            .andExpect(status().isOk());
}

    private Long savePublicPost(User user, Category postCategory, String title) {
        return postRepository.saveAndFlush(Post.builder()
            .user(user)
            .category(postCategory)
            .title(title)
            .content(title + " 내용")
            .isPublic(true)
            .build()).getId();
    }

    // ────────────────────────── JWT 필터 토큰 처리 ──────────────────────────

    @Test @DisplayName("유효하지 않은 Bearer 토큰으로 공개 GET → 401")
    void getOne_invalidToken() throws Exception {
        mockMvc.perform(get("/api/v1/posts/{id}", publicPostId)
                .header("Authorization", "Bearer this.is.not.a.valid.jwt"))
            .andExpect(status().isUnauthorized());
    }

    @Test @DisplayName("만료된 Bearer 토큰으로 공개 GET → 401")
    void getOne_expiredToken() throws Exception {
        String expired = Jwts.builder()
            .setSubject("999")
            .setExpiration(new Date(0))
            .signWith(TEST_KEY, SignatureAlgorithm.HS256)
            .compact();
        mockMvc.perform(get("/api/v1/posts/{id}", publicPostId)
                .header("Authorization", "Bearer " + expired))
            .andExpect(status().isUnauthorized());
    }

    @Test @DisplayName("Bearer 아닌 Authorization 헤더로 공개 GET → 401")
    void getOne_nonBearerAuth() throws Exception {
        mockMvc.perform(get("/api/v1/posts/{id}", publicPostId)
                .header("Authorization", "Basic dXNlcjpwYXNz"))
            .andExpect(status().isUnauthorized());
    }

    @Test @DisplayName("유효한 토큰으로 공개 GET → 200")
    void getOne_validToken_public() throws Exception {
        mockMvc.perform(get("/api/v1/posts/{id}", publicPostId)
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk());
    }

    @Test @DisplayName("refresh token으로 보호 API 요청 → 401")
    void create_refreshToken_unauthorized() throws Exception {
        String refreshToken = jwtProvider.createRefreshToken(authorDbId);

        mockMvc.perform(post("/api/v1/posts")
                .header("Authorization", "Bearer " + refreshToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"refresh token\",\"content\":\"본문\"}"))
            .andExpect(status().isUnauthorized());
    }
}
