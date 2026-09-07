package com.example.atlex.domain.post;

import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import com.example.atlex.global.security.jwt.JwtProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.MOCK,
    properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.jpa.hibernate.ddl-auto=create-drop"
    }
)
@Transactional
class PostFavoriteControllerTest {

    @Autowired WebApplicationContext context;
    @Autowired JwtProvider jwtProvider;
    @Autowired UserRepository userRepository;
    @Autowired PostRepository postRepository;

    private MockMvc mockMvc;

    private User author;
    private User other;
    private String authorToken;
    private String otherToken;

    private Post publicPost;
    private Post privatePost;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
            .apply(SecurityMockMvcConfigurers.springSecurity())
            .build();

        author = userRepository.saveAndFlush(User.builder()
            .userId("author").email("author@test.com").password("pw").name("작성자").active(true).build());
        other = userRepository.saveAndFlush(User.builder()
            .userId("other").email("other@test.com").password("pw").name("타인").active(true).build());

        authorToken = jwtProvider.createAccessToken(author.getId());
        otherToken = jwtProvider.createAccessToken(other.getId());

        publicPost = postRepository.saveAndFlush(Post.builder()
            .user(author).title("공개글").content("공개 내용").isPublic(true).build());
        privatePost = postRepository.saveAndFlush(Post.builder()
            .user(author).title("비공개글").content("비공개 내용").isPublic(false).build());
    }

    // ────────────────────────── 등록 ──────────────────────────

    @Test @DisplayName("즐겨찾기 등록 성공 → 200, favorited=true")
    void addFavorite_success() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/favorites", publicPost.getId())
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.postId").value(publicPost.getId()))
            .andExpect(jsonPath("$.data.favorited").value(true));
    }

    @Test @DisplayName("중복 즐겨찾기 요청해도 멱등하게 favorited=true")
    void addFavorite_duplicate_idempotent() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/favorites", publicPost.getId())
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/posts/{postId}/favorites", publicPost.getId())
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.favorited").value(true));
    }

    @Test @DisplayName("비로그인 즐겨찾기 → 401")
    void addFavorite_anonymous() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/favorites", publicPost.getId()))
            .andExpect(status().isUnauthorized());
    }

    @Test @DisplayName("없는 게시글 즐겨찾기 → 404")
    void addFavorite_postNotFound() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/favorites", 999999L)
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("POST_NOT_FOUND"));
    }

    @Test @DisplayName("soft delete된 게시글 즐겨찾기 → 404")
    void addFavorite_softDeletedPost() throws Exception {
        publicPost.softDelete();
        postRepository.saveAndFlush(publicPost);

        mockMvc.perform(post("/api/v1/posts/{postId}/favorites", publicPost.getId())
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("POST_NOT_FOUND"));
    }

    @Test @DisplayName("비공개 게시글에 비작성자가 즐겨찾기 → 404")
    void addFavorite_privatePost_notAuthor() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/favorites", privatePost.getId())
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("POST_NOT_FOUND"));
    }

    @Test @DisplayName("비공개 게시글에 작성자 본인이 즐겨찾기 → 200")
    void addFavorite_privatePost_author() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/favorites", privatePost.getId())
                .header("Authorization", "Bearer " + authorToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.favorited").value(true));
    }

    // ────────────────────────── 해제 ──────────────────────────

    @Test @DisplayName("즐겨찾기 해제 성공 → 200, favorited=false")
    void removeFavorite_success() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/favorites", publicPost.getId())
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/posts/{postId}/favorites", publicPost.getId())
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.favorited").value(false));
    }

    @Test @DisplayName("즐겨찾기하지 않은 상태에서 해제해도 에러 없이 favorited=false")
    void removeFavorite_whenNotFavorited_idempotent() throws Exception {
        mockMvc.perform(delete("/api/v1/posts/{postId}/favorites", publicPost.getId())
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.favorited").value(false));
    }

    @Test @DisplayName("비로그인 즐겨찾기 해제 → 401")
    void removeFavorite_anonymous() throws Exception {
        mockMvc.perform(delete("/api/v1/posts/{postId}/favorites", publicPost.getId()))
            .andExpect(status().isUnauthorized());
    }

    // ────────────────────────── 목록 ──────────────────────────

    @Test @DisplayName("내 즐겨찾기 목록 → 최근 저장순으로 조회")
    void getMyFavorites_recentFirst() throws Exception {
        Post secondPost = postRepository.saveAndFlush(Post.builder()
            .user(author).title("두번째글").content("내용").isPublic(true).build());

        mockMvc.perform(post("/api/v1/posts/{postId}/favorites", publicPost.getId())
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/posts/{postId}/favorites", secondPost.getId())
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/posts/favorites")
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalElements").value(2))
            .andExpect(jsonPath("$.data.content[0].id").value(secondPost.getId()))
            .andExpect(jsonPath("$.data.content[1].id").value(publicPost.getId()));
    }

    @Test @DisplayName("내 즐겨찾기 목록은 다른 사용자의 즐겨찾기와 격리된다")
    void getMyFavorites_isolatedPerUser() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/favorites", publicPost.getId())
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/posts/favorites")
                .header("Authorization", "Bearer " + authorToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test @DisplayName("즐겨찾기한 뒤 soft delete된 게시글은 목록에서 제외된다")
    void getMyFavorites_excludesSoftDeleted() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/favorites", publicPost.getId())
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk());

        publicPost.softDelete();
        postRepository.saveAndFlush(publicPost);

        mockMvc.perform(get("/api/v1/posts/favorites")
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test @DisplayName("비로그인 즐겨찾기 목록 조회 → 401")
    void getMyFavorites_anonymous() throws Exception {
        mockMvc.perform(get("/api/v1/posts/favorites"))
            .andExpect(status().isUnauthorized());
    }
}
