package com.example.atlex.domain.comment;

import com.example.atlex.domain.comment.entity.Comment;
import com.example.atlex.domain.comment.repository.CommentRepository;
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
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
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
class CommentControllerTest {

    @Autowired WebApplicationContext context;
    @Autowired JwtProvider jwtProvider;
    @Autowired UserRepository userRepository;
    @Autowired PostRepository postRepository;
    @Autowired CommentRepository commentRepository;

    private MockMvc mockMvc;

    private User author;   // 게시글 작성자
    private User other;    // 댓글 작성자(타인)
    private User stranger; // 제3자

    private String authorToken;
    private String otherToken;
    private String strangerToken;

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
        stranger = userRepository.saveAndFlush(User.builder()
            .userId("stranger").email("stranger@test.com").password("pw").name("제3자").active(true).build());

        authorToken = jwtProvider.createAccessToken(author.getId());
        otherToken = jwtProvider.createAccessToken(other.getId());
        strangerToken = jwtProvider.createAccessToken(stranger.getId());

        publicPost = postRepository.saveAndFlush(Post.builder()
            .user(author).title("공개글").content("공개 내용").isPublic(true).build());
        privatePost = postRepository.saveAndFlush(Post.builder()
            .user(author).title("비공개글").content("비공개 내용").isPublic(false).build());
    }

    private Comment saveComment(Post post, User user, String content) {
        return commentRepository.saveAndFlush(Comment.builder()
            .post(post).user(user).content(content).build());
    }

    // ────────────────────────── 작성 ──────────────────────────

    @Test @DisplayName("로그인 + 공개 게시글 댓글 작성 → 201")
    void create_success() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/comments", publicPost.getId())
                .header("Authorization", "Bearer " + otherToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"좋은 글이네요\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.content").value("좋은 글이네요"))
            .andExpect(jsonPath("$.data.postId").value(publicPost.getId()))
            .andExpect(jsonPath("$.data.authorUserId").value("other"));
    }

    @Test @DisplayName("비로그인 댓글 작성 → 401")
    void create_anonymous() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/comments", publicPost.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"댓글\"}"))
            .andExpect(status().isUnauthorized());
    }

    @Test @DisplayName("댓글 작성 시 빈 content → 400")
    void create_blankContent() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/comments", publicPost.getId())
                .header("Authorization", "Bearer " + otherToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errors[0].data.key").value("content"));
    }

    @Test @DisplayName("댓글 작성 시 content 1000자 초과 → 400")
    void create_contentTooLong() throws Exception {
        String longContent = "a".repeat(1001);
        mockMvc.perform(post("/api/v1/posts/{postId}/comments", publicPost.getId())
                .header("Authorization", "Bearer " + otherToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"" + longContent + "\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errors[0].data.key").value("content"));
    }

    @Test @DisplayName("없는 게시글에 댓글 작성 → 404")
    void create_postNotFound() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/comments", 999999L)
                .header("Authorization", "Bearer " + otherToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"댓글\"}"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("POST_NOT_FOUND"));
    }

    @Test @DisplayName("비공개 게시글에 비작성자가 댓글 작성 → 404")
    void create_privatePost_notAuthor() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/comments", privatePost.getId())
                .header("Authorization", "Bearer " + otherToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"댓글\"}"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("POST_NOT_FOUND"));
    }

    @Test @DisplayName("비공개 게시글에 작성자 본인이 댓글 작성 → 201")
    void create_privatePost_author() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/comments", privatePost.getId())
                .header("Authorization", "Bearer " + authorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"내 비공개글 댓글\"}"))
            .andExpect(status().isCreated());
    }

    // ────────────────────────── 목록 조회 ──────────────────────────

    @Test @DisplayName("비로그인 + 공개 게시글 댓글 목록 조회 → 200")
    void getList_anonymous_public() throws Exception {
        saveComment(publicPost, other, "댓글1");

        mockMvc.perform(get("/api/v1/posts/{postId}/comments", publicPost.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.length()").value(1))
            .andExpect(jsonPath("$.data[0].content").value("댓글1"));
    }

    @Test @DisplayName("비로그인 + 비공개 게시글 댓글 목록 조회 → 404")
    void getList_anonymous_private() throws Exception {
        mockMvc.perform(get("/api/v1/posts/{postId}/comments", privatePost.getId()))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("POST_NOT_FOUND"));
    }

    @Test @DisplayName("댓글 목록은 createdAt ASC, id ASC 순으로 반환한다")
    void getList_orderedByCreatedAtThenId() throws Exception {
        Comment c1 = saveComment(publicPost, other, "첫번째");
        Comment c2 = saveComment(publicPost, author, "두번째");
        Comment c3 = saveComment(publicPost, other, "세번째");

        mockMvc.perform(get("/api/v1/posts/{postId}/comments", publicPost.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.length()").value(3))
            .andExpect(jsonPath("$.data[0].id").value(c1.getId()))
            .andExpect(jsonPath("$.data[1].id").value(c2.getId()))
            .andExpect(jsonPath("$.data[2].id").value(c3.getId()));
    }

    // ────────────────────────── 수정 ──────────────────────────

    @Test @DisplayName("댓글 작성자 본인 수정 → 200")
    void update_author() throws Exception {
        Comment comment = saveComment(publicPost, other, "원본");

        mockMvc.perform(patch("/api/v1/comments/{commentId}", comment.getId())
                .header("Authorization", "Bearer " + otherToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"수정됨\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content").value("수정됨"));
    }

    @Test @DisplayName("타인이 댓글 수정 → 403")
    void update_forbidden() throws Exception {
        Comment comment = saveComment(publicPost, other, "원본");

        mockMvc.perform(patch("/api/v1/comments/{commentId}", comment.getId())
                .header("Authorization", "Bearer " + strangerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"수정 시도\"}"))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.code").value("COMMENT_UPDATE_FORBIDDEN"));
    }

    @Test @DisplayName("없는 댓글 수정 → 404")
    void update_notFound() throws Exception {
        mockMvc.perform(patch("/api/v1/comments/{commentId}", 999999L)
                .header("Authorization", "Bearer " + otherToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"수정\"}"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("COMMENT_NOT_FOUND"));
    }

    @Test @DisplayName("빈 content 로 댓글 수정 → 400")
    void update_blankContent() throws Exception {
        Comment comment = saveComment(publicPost, other, "원본");

        mockMvc.perform(patch("/api/v1/comments/{commentId}", comment.getId())
                .header("Authorization", "Bearer " + otherToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errors[0].data.key").value("content"));
    }

    @Test @DisplayName("soft delete된 게시글의 댓글 수정 → 404")
    void update_onDeletedPost() throws Exception {
        Comment comment = saveComment(publicPost, other, "원본");
        publicPost.softDelete();
        postRepository.saveAndFlush(publicPost);

        mockMvc.perform(patch("/api/v1/comments/{commentId}", comment.getId())
                .header("Authorization", "Bearer " + otherToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"수정 시도\"}"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("COMMENT_NOT_FOUND"));
    }

    @Test @DisplayName("비공개로 전환된 게시글의 댓글을 작성자 본인이 수정 → 200")
    void update_onPrivatePost_author() throws Exception {
        Comment comment = saveComment(privatePost, author, "비공개글 댓글");

        mockMvc.perform(patch("/api/v1/comments/{commentId}", comment.getId())
                .header("Authorization", "Bearer " + authorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"수정됨\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content").value("수정됨"));
    }

    // ────────────────────────── 삭제 ──────────────────────────

    @Test @DisplayName("댓글 작성자 본인 삭제 → 204")
    void delete_commentAuthor() throws Exception {
        Comment comment = saveComment(publicPost, other, "댓글");

        mockMvc.perform(delete("/api/v1/comments/{commentId}", comment.getId())
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isNoContent());
    }

    @Test @DisplayName("게시글 작성자가 타인 댓글 삭제 → 204")
    void delete_postAuthor() throws Exception {
        Comment comment = saveComment(publicPost, other, "댓글");

        mockMvc.perform(delete("/api/v1/comments/{commentId}", comment.getId())
                .header("Authorization", "Bearer " + authorToken))
            .andExpect(status().isNoContent());
    }

    @Test @DisplayName("제3자가 댓글 삭제 → 403")
    void delete_forbidden() throws Exception {
        Comment comment = saveComment(publicPost, other, "댓글");

        mockMvc.perform(delete("/api/v1/comments/{commentId}", comment.getId())
                .header("Authorization", "Bearer " + strangerToken))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.code").value("COMMENT_DELETE_FORBIDDEN"));
    }

    @Test @DisplayName("비로그인 댓글 삭제 → 401")
    void delete_anonymous() throws Exception {
        Comment comment = saveComment(publicPost, other, "댓글");

        mockMvc.perform(delete("/api/v1/comments/{commentId}", comment.getId()))
            .andExpect(status().isUnauthorized());
    }

    @Test @DisplayName("삭제된 댓글은 목록에서 제외된다")
    void delete_thenExcludedFromList() throws Exception {
        Comment keep = saveComment(publicPost, other, "유지");
        Comment remove = saveComment(publicPost, other, "삭제 대상");

        mockMvc.perform(delete("/api/v1/comments/{commentId}", remove.getId())
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/posts/{postId}/comments", publicPost.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.length()").value(1))
            .andExpect(jsonPath("$.data[0].id").value(keep.getId()));
    }

    @Test @DisplayName("soft delete된 게시글의 댓글 삭제 → 404")
    void delete_onDeletedPost() throws Exception {
        Comment comment = saveComment(publicPost, other, "댓글");
        publicPost.softDelete();
        postRepository.saveAndFlush(publicPost);

        mockMvc.perform(delete("/api/v1/comments/{commentId}", comment.getId())
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("COMMENT_NOT_FOUND"));
    }
}
