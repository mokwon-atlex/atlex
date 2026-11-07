package com.example.atlex.domain.report;

import com.example.atlex.domain.comment.entity.Comment;
import com.example.atlex.domain.comment.repository.CommentRepository;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.report.entity.Report;
import com.example.atlex.domain.report.entity.ReportReason;
import com.example.atlex.domain.report.entity.ReportStatus;
import com.example.atlex.domain.report.entity.ReportTargetType;
import com.example.atlex.domain.report.repository.ReportRepository;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.entity.UserRole;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Transactional
class ReportControllerTest {

    private static final String SPAM_BODY = "{\"reason\":\"SPAM\",\"description\":\"광고입니다\"}";

    @Autowired
    WebApplicationContext context;
    @Autowired
    JwtProvider jwtProvider;
    @Autowired
    UserRepository userRepository;
    @Autowired
    PostRepository postRepository;
    @Autowired
    CommentRepository commentRepository;
    @Autowired
    ReportRepository reportRepository;

    private MockMvc mockMvc;

    private User author;
    private User reporter;
    private User admin;

    private String authorToken;
    private String reporterToken;
    private String adminToken;

    private Post publicPost;
    private Post privatePost;
    private Comment comment;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
            .apply(SecurityMockMvcConfigurers.springSecurity())
            .build();

        author = userRepository.saveAndFlush(User.builder()
            .userId("author").email("author@test.com").password("pw").name("작성자").active(true).build());
        reporter = userRepository.saveAndFlush(User.builder()
            .userId("reporter").email("reporter@test.com").password("pw").name("신고자").active(true).build());
        admin = userRepository.saveAndFlush(User.builder()
            .userId("admin").email("admin@test.com").password("pw").name("관리자").active(true)
            .role(UserRole.ADMIN).build());

        authorToken = "Bearer " + jwtProvider.createAccessToken(author.getId());
        reporterToken = "Bearer " + jwtProvider.createAccessToken(reporter.getId());
        adminToken = "Bearer " + jwtProvider.createAccessToken(admin.getId());

        publicPost = postRepository.saveAndFlush(Post.builder()
            .user(author).title("공개글").content("공개 내용").isPublic(true).build());
        privatePost = postRepository.saveAndFlush(Post.builder()
            .user(author).title("비공개글").content("비공개 내용").isPublic(false).build());
        comment = commentRepository.saveAndFlush(Comment.builder()
            .post(publicPost).user(author).content("광고 댓글").build());
    }

    private Report saveReport(User user, ReportTargetType type, Long targetId) {
        return reportRepository.saveAndFlush(Report.builder()
            .reporter(user).targetType(type).targetId(targetId).reason(ReportReason.SPAM).build());
    }

    // ────────────────────────── 신고 접수 ──────────────────────────

    @Test
    @DisplayName("게시물 신고 → 201, 접수 상태로 저장")
    void reportPost_success() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/reports", publicPost.getId())
            .header("Authorization", reporterToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(SPAM_BODY))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.targetType").value("POST"))
            .andExpect(jsonPath("$.data.targetId").value(publicPost.getId()))
            .andExpect(jsonPath("$.data.status").value("PENDING"));

        assertThat(reportRepository.existsByReporter_IdAndTargetTypeAndTargetId(
            reporter.getId(), ReportTargetType.POST, publicPost.getId())).isTrue();
    }

    @Test
    @DisplayName("댓글 신고 → 201")
    void reportComment_success() throws Exception {
        mockMvc.perform(post("/api/v1/comments/{commentId}/reports", comment.getId())
            .header("Authorization", reporterToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"reason\":\"ABUSE\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.targetType").value("COMMENT"))
            .andExpect(jsonPath("$.data.reason").value("ABUSE"));
    }

    @Test
    @DisplayName("같은 게시물을 다시 신고하면 409 DUPLICATE_REPORT")
    void reportPost_duplicate() throws Exception {
        saveReport(reporter, ReportTargetType.POST, publicPost.getId());

        mockMvc.perform(post("/api/v1/posts/{postId}/reports", publicPost.getId())
            .header("Authorization", reporterToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(SPAM_BODY))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("DUPLICATE_REPORT"));
    }

    @Test
    @DisplayName("같은 ID라도 게시물 신고와 댓글 신고는 별개로 접수된다")
    void report_sameIdDifferentType() throws Exception {
        saveReport(reporter, ReportTargetType.POST, comment.getId());

        mockMvc.perform(post("/api/v1/comments/{commentId}/reports", comment.getId())
            .header("Authorization", reporterToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(SPAM_BODY))
            .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("본인 게시물 신고 → 400 SELF_REPORT_NOT_ALLOWED")
    void reportPost_self() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/reports", publicPost.getId())
            .header("Authorization", authorToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(SPAM_BODY))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("SELF_REPORT_NOT_ALLOWED"));
    }

    @Test
    @DisplayName("기타 사유에 설명이 없으면 400 REPORT_DESCRIPTION_REQUIRED")
    void report_otherWithoutDescription() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/reports", publicPost.getId())
            .header("Authorization", reporterToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"reason\":\"OTHER\",\"description\":\"   \"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("REPORT_DESCRIPTION_REQUIRED"));
    }

    @Test
    @DisplayName("사유 누락 → 400 VALIDATION_ERROR")
    void report_missingReason() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/reports", publicPost.getId())
            .header("Authorization", reporterToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("비공개 게시물 신고 → 404로 존재를 숨긴다")
    void reportPost_private() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/reports", privatePost.getId())
            .header("Authorization", reporterToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(SPAM_BODY))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("POST_NOT_FOUND"));
    }

    @Test
    @DisplayName("삭제된 댓글 신고 → 404")
    void reportComment_deleted() throws Exception {
        comment.softDelete();
        commentRepository.saveAndFlush(comment);

        mockMvc.perform(post("/api/v1/comments/{commentId}/reports", comment.getId())
            .header("Authorization", reporterToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(SPAM_BODY))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("COMMENT_NOT_FOUND"));
    }

    @Test
    @DisplayName("비로그인 신고 → 401")
    void report_unauthenticated() throws Exception {
        mockMvc.perform(post("/api/v1/posts/{postId}/reports", publicPost.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .content(SPAM_BODY))
            .andExpect(status().isUnauthorized());
    }

    // ────────────────────────── 관리자 조회 ──────────────────────────

    @Test
    @DisplayName("일반 사용자는 관리자 신고 목록에 접근할 수 없다 → 403")
    void adminList_forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/admin/reports")
            .header("Authorization", reporterToken))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("관리자 신고 목록을 상태로 필터링한다")
    void adminList_filterByStatus() throws Exception {
        saveReport(reporter, ReportTargetType.POST, publicPost.getId());
        Report processed = saveReport(reporter, ReportTargetType.COMMENT, comment.getId());
        processed.process(admin, ReportStatus.REJECTED, "문제 없음");
        reportRepository.saveAndFlush(processed);

        mockMvc.perform(get("/api/v1/admin/reports")
            .param("status", "PENDING")
            .header("Authorization", adminToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalElements").value(1))
            .andExpect(jsonPath("$.data.content[0].targetType").value("POST"))
            .andExpect(jsonPath("$.data.content[0].reporterUserId").value("reporter"));
    }

    @Test
    @DisplayName("관리자 신고 상세는 대상 콘텐츠 요약을 포함한다")
    void adminDetail_includesTarget() throws Exception {
        Report report = saveReport(reporter, ReportTargetType.COMMENT, comment.getId());

        mockMvc.perform(get("/api/v1/admin/reports/{reportId}", report.getId())
            .header("Authorization", adminToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.report.id").value(report.getId()))
            .andExpect(jsonPath("$.data.target.postId").value(publicPost.getId()))
            .andExpect(jsonPath("$.data.target.postAuthorUserId").value("author"))
            .andExpect(jsonPath("$.data.target.authorUserId").value("author"))
            .andExpect(jsonPath("$.data.target.preview").value("광고 댓글"))
            .andExpect(jsonPath("$.data.target.deleted").value(false));
    }

    @Test
    @DisplayName("없는 신고 상세 → 404 REPORT_NOT_FOUND")
    void adminDetail_notFound() throws Exception {
        mockMvc.perform(get("/api/v1/admin/reports/{reportId}", 9999L)
            .header("Authorization", adminToken))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("REPORT_NOT_FOUND"));
    }

    // ────────────────────────── 관리자 처리 ──────────────────────────

    @Test
    @DisplayName("관리자가 신고를 처리하면 결과와 처리자가 기록된다")
    void adminProcess_success() throws Exception {
        Report report = saveReport(reporter, ReportTargetType.POST, publicPost.getId());

        mockMvc.perform(patch("/api/v1/admin/reports/{reportId}", report.getId())
            .header("Authorization", adminToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"status\":\"RESOLVED\",\"resultMemo\":\"경고 조치\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.status").value("RESOLVED"))
            .andExpect(jsonPath("$.data.processedByUserId").value("admin"))
            .andExpect(jsonPath("$.data.resultMemo").value("경고 조치"))
            .andExpect(jsonPath("$.data.processedAt").isNotEmpty());

        Report saved = reportRepository.findById(report.getId()).orElseThrow();
        assertThat(saved.getStatus()).isEqualTo(ReportStatus.RESOLVED);
        assertThat(saved.getProcessedBy().getId()).isEqualTo(admin.getId());
    }

    @Test
    @DisplayName("이미 처리된 신고를 다시 처리하면 409 REPORT_ALREADY_PROCESSED")
    void adminProcess_alreadyProcessed() throws Exception {
        Report report = saveReport(reporter, ReportTargetType.POST, publicPost.getId());
        report.process(admin, ReportStatus.REJECTED, "문제 없음");
        reportRepository.saveAndFlush(report);

        mockMvc.perform(patch("/api/v1/admin/reports/{reportId}", report.getId())
            .header("Authorization", adminToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"status\":\"RESOLVED\",\"resultMemo\":\"재처리\"}"))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("REPORT_ALREADY_PROCESSED"));
    }

    @Test
    @DisplayName("처리 결과로 PENDING을 지정하면 400 INVALID_REPORT_STATUS")
    void adminProcess_pendingStatus() throws Exception {
        Report report = saveReport(reporter, ReportTargetType.POST, publicPost.getId());

        mockMvc.perform(patch("/api/v1/admin/reports/{reportId}", report.getId())
            .header("Authorization", adminToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"status\":\"PENDING\",\"resultMemo\":\"보류\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("INVALID_REPORT_STATUS"));
    }

    @Test
    @DisplayName("일반 사용자는 신고를 처리할 수 없다 → 403")
    void adminProcess_forbidden() throws Exception {
        Report report = saveReport(reporter, ReportTargetType.POST, publicPost.getId());

        mockMvc.perform(patch("/api/v1/admin/reports/{reportId}", report.getId())
            .header("Authorization", reporterToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"status\":\"RESOLVED\",\"resultMemo\":\"경고 조치\"}"))
            .andExpect(status().isForbidden());
    }
}
