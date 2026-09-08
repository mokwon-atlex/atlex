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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Transactional
class PostLikeControllerTest {

    @Autowired
    WebApplicationContext context;
    @Autowired
    JwtProvider jwtProvider;
    @Autowired
    UserRepository userRepository;
    @Autowired
    PostRepository postRepository;

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

    @Test
    @DisplayName("좋아요 등록 성공 → 200, liked=true, likes=1")
    void like_success() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/likes", publicPost.getId())
            .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.postId").value(publicPost.getId()))
            .andExpect(jsonPath("$.data.liked").value(true))
            .andExpect(jsonPath("$.data.likes").value(1));
    }

    @Test
    @DisplayName("중복 좋아요 요청해도 likes가 중복 증가하지 않는다")
    void like_duplicate_noDoubleCount() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/likes", publicPost.getId())
            .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/posts/{postId}/likes", publicPost.getId())
            .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.liked").value(true))
            .andExpect(jsonPath("$.data.likes").value(1));
    }

    @Test
    @DisplayName("비로그인 좋아요 → 401")
    void like_anonymous() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/likes", publicPost.getId()))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("없는 게시글에 좋아요 → 404")
    void like_postNotFound() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/likes", 999999L)
            .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("POST_NOT_FOUND"));
    }

    @Test
    @DisplayName("soft delete된 게시글에 좋아요 → 404")
    void like_softDeletedPost() throws Exception {
        publicPost.softDelete();
        postRepository.saveAndFlush(publicPost);

        mockMvc.perform(post("/api/v1/posts/{postId}/likes", publicPost.getId())
            .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("POST_NOT_FOUND"));
    }

    @Test
    @DisplayName("비공개 게시글에 비작성자가 좋아요 → 404")
    void like_privatePost_notAuthor() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/likes", privatePost.getId())
            .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("POST_NOT_FOUND"));
    }

    @Test
    @DisplayName("비공개 게시글에 작성자 본인이 좋아요 → 200")
    void like_privatePost_author() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/likes", privatePost.getId())
            .header("Authorization", "Bearer " + authorToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.liked").value(true))
            .andExpect(jsonPath("$.data.likes").value(1));
    }

    // ────────────────────────── 취소 ──────────────────────────

    @Test
    @DisplayName("좋아요 취소 성공 → 200, liked=false, likes=0")
    void unlike_success() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/likes", publicPost.getId())
            .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/posts/{postId}/likes", publicPost.getId())
            .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.liked").value(false))
            .andExpect(jsonPath("$.data.likes").value(0));
    }

    @Test
    @DisplayName("좋아요하지 않은 상태에서 취소해도 likes가 음수가 되지 않는다")
    void unlike_whenNotLiked_noNegative() throws Exception {
        mockMvc.perform(delete("/api/v1/posts/{postId}/likes", publicPost.getId())
            .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.liked").value(false))
            .andExpect(jsonPath("$.data.likes").value(0));
    }

    @Test
    @DisplayName("비로그인 좋아요 취소 → 401")
    void unlike_anonymous() throws Exception {
        mockMvc.perform(delete("/api/v1/posts/{postId}/likes", publicPost.getId()))
            .andExpect(status().isUnauthorized());
    }

    // ────────────────────────── 다중 사용자 ──────────────────────────

    @Test
    @DisplayName("서로 다른 두 사용자가 같은 게시글에 좋아요 → likes=2")
    void like_byTwoUsers_countsTwo() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/likes", publicPost.getId())
            .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/posts/{postId}/likes", publicPost.getId())
            .header("Authorization", "Bearer " + authorToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.liked").value(true))
            .andExpect(jsonPath("$.data.likes").value(2));
    }

    @Test
    @DisplayName("B가 좋아요한 게시글을 A가 취소해도 B의 좋아요는 유지되고 likes는 감소하지 않는다")
    void unlike_byNonLiker_keepsOthersLike() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/likes", publicPost.getId())
            .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/posts/{postId}/likes", publicPost.getId())
            .header("Authorization", "Bearer " + authorToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.liked").value(false))
            .andExpect(jsonPath("$.data.likes").value(1));
    }

    @Test
    @DisplayName("like → unlike → like 재수행 시 최종 likes=1")
    void like_unlike_like_finalOne() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/likes", publicPost.getId())
            .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/posts/{postId}/likes", publicPost.getId())
            .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/posts/{postId}/likes", publicPost.getId())
            .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.liked").value(true))
            .andExpect(jsonPath("$.data.likes").value(1));
    }
}
