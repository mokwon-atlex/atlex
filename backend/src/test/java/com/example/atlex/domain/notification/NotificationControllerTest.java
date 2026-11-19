package com.example.atlex.domain.notification;

import com.example.atlex.domain.comment.entity.Comment;
import com.example.atlex.domain.comment.repository.CommentRepository;
import com.example.atlex.domain.notification.entity.Notification;
import com.example.atlex.domain.notification.entity.NotificationType;
import com.example.atlex.domain.notification.repository.NotificationRepository;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.repository.PostRepository;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, properties = {
    "spring.datasource.url=jdbc:h2:mem:notificationtestdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Transactional
class NotificationControllerTest {

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
    NotificationRepository notificationRepository;

    private MockMvc mockMvc;
    private String recipientToken;
    private String otherToken;
    private Long recipientId;
    private Long notificationId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
            .apply(SecurityMockMvcConfigurers.springSecurity())
            .build();

        User recipient = userRepository.saveAndFlush(User.builder()
            .userId("recipient")
            .email("recipient@test.com")
            .password("pw")
            .name("수신자")
            .active(true)
            .role(UserRole.USER)
            .build());
        User actor = userRepository.saveAndFlush(User.builder()
            .userId("actor")
            .email("actor@test.com")
            .password("pw")
            .name("댓글작성자")
            .active(true)
            .role(UserRole.USER)
            .build());
        User other = userRepository.saveAndFlush(User.builder()
            .userId("other")
            .email("other@test.com")
            .password("pw")
            .name("다른사용자")
            .active(true)
            .role(UserRole.USER)
            .build());

        Post post = postRepository.saveAndFlush(Post.builder()
            .user(recipient)
            .title("알림 테스트 게시글")
            .content("본문")
            .isPublic(true)
            .build());
        Comment comment = commentRepository.saveAndFlush(Comment.builder()
            .post(post)
            .user(actor)
            .content("테스트 댓글입니다")
            .build());
        Notification notification = notificationRepository.saveAndFlush(Notification.builder()
            .recipient(recipient)
            .actor(actor)
            .type(NotificationType.COMMENT)
            .post(post)
            .comment(comment)
            .build());

        recipientId = recipient.getId();
        notificationId = notification.getId();
        recipientToken = jwtProvider.createAccessToken(recipient.getId());
        otherToken = jwtProvider.createAccessToken(other.getId());
    }

    @Test
    @DisplayName("비인증 사용자는 알림 목록을 조회할 수 없다")
    void requiresAuth() throws Exception {
        mockMvc.perform(get("/api/v1/notifications"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("알림 목록과 읽지 않은 개수를 조회하고 단건·전체 읽음 처리를 수행한다")
    void getAndMarkNotifications() throws Exception {
        mockMvc.perform(get("/api/v1/notifications")
            .header("Authorization", "Bearer " + recipientToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content[0].actorName").value("댓글작성자"))
            .andExpect(jsonPath("$.data.content[0].postTitle").value("알림 테스트 게시글"))
            .andExpect(jsonPath("$.data.content[0].commentContent").value("테스트 댓글입니다"))
            .andExpect(jsonPath("$.data.content[0].isRead").value(false));

        mockMvc.perform(get("/api/v1/notifications/unread-count")
            .header("Authorization", "Bearer " + recipientToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.unreadCount").value(1));

        mockMvc.perform(patch("/api/v1/notifications/" + notificationId + "/read")
            .header("Authorization", "Bearer " + recipientToken))
            .andExpect(status().isOk());

        assertEquals(0L, notificationRepository.countByRecipient_IdAndIsReadFalse(recipientId));

        mockMvc.perform(patch("/api/v1/notifications/read-all")
            .header("Authorization", "Bearer " + recipientToken))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("타인의 알림을 읽음 처리하려고 하면 403 예외가 발생한다")
    void forbidReadingOthersNotification() throws Exception {
        mockMvc.perform(patch("/api/v1/notifications/" + notificationId + "/read")
            .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.code").value("NOTIFICATION_ACCESS_DENIED"));
    }

    @Test
    @DisplayName("알림 설정을 조회하고 수정한 값이 유지된다")
    void getAndUpdateNotificationSettings() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/settings")
            .header("Authorization", "Bearer " + recipientToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.commentEnabled").value(true))
            .andExpect(jsonPath("$.data.likeEnabled").value(true))
            .andExpect(jsonPath("$.data.followEnabled").value(true))
            .andExpect(jsonPath("$.data.noticeEnabled").value(true));

        mockMvc.perform(patch("/api/v1/notifications/settings")
            .header("Authorization", "Bearer " + recipientToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "commentEnabled": false,
                  "likeEnabled": true,
                  "followEnabled": false,
                  "noticeEnabled": true
                }
                """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.commentEnabled").value(false))
            .andExpect(jsonPath("$.data.followEnabled").value(false));

        mockMvc.perform(get("/api/v1/notifications/settings")
            .header("Authorization", "Bearer " + recipientToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.commentEnabled").value(false))
            .andExpect(jsonPath("$.data.likeEnabled").value(true))
            .andExpect(jsonPath("$.data.followEnabled").value(false))
            .andExpect(jsonPath("$.data.noticeEnabled").value(true));
    }

    @Test
    @DisplayName("타인의 알림을 삭제하려고 하면 403 예외가 발생한다")
    void forbidDeletingOthersNotification() throws Exception {
        mockMvc.perform(delete("/api/v1/notifications/" + notificationId)
            .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.code").value("NOTIFICATION_ACCESS_DENIED"));
    }

    @Test
    @DisplayName("본인의 알림을 단건 삭제하고 전체 삭제할 수 있다")
    void deleteNotificationAndDeleteAll() throws Exception {
        mockMvc.perform(delete("/api/v1/notifications/" + notificationId)
            .header("Authorization", "Bearer " + recipientToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"));

        assertEquals(0L, notificationRepository.count());

        mockMvc.perform(delete("/api/v1/notifications")
            .header("Authorization", "Bearer " + recipientToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"));
    }

    @Test
    @DisplayName("인증된 사용자는 SSE 알림 스트림을 구독할 수 있고 미인증 요청은 401을 반환한다")
    void subscribeSse() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/subscribe"))
            .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/notifications/subscribe")
            .header("Authorization", "Bearer " + recipientToken)
            .accept(MediaType.TEXT_EVENT_STREAM))
            .andExpect(status().isOk());
    }
}
