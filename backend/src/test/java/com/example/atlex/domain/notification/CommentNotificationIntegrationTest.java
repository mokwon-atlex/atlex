package com.example.atlex.domain.notification;

import com.example.atlex.domain.comment.dto.request.CommentCreateRequest;
import com.example.atlex.domain.comment.dto.response.CommentResponse;
import com.example.atlex.domain.comment.repository.CommentRepository;
import com.example.atlex.domain.comment.service.CommentService;
import com.example.atlex.domain.notification.entity.Notification;
import com.example.atlex.domain.notification.entity.NotificationType;
import com.example.atlex.domain.notification.repository.NotificationRepository;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 댓글 작성 트랜잭션 커밋 후 이벤트 리스너를 거쳐 알림이 저장되는 흐름을 검증한다.
 * 커밋 이후 동작을 확인해야 하므로 테스트 트랜잭션을 사용하지 않고 각 테스트 후 데이터를 정리한다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, properties = {
    "spring.datasource.url=jdbc:h2:mem:notificationdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class CommentNotificationIntegrationTest {

    @Autowired
    CommentService commentService;
    @Autowired
    NotificationRepository notificationRepository;
    @Autowired
    CommentRepository commentRepository;
    @Autowired
    PostRepository postRepository;
    @Autowired
    UserRepository userRepository;

    @AfterEach
    void tearDown() {
        notificationRepository.deleteAllInBatch();
        commentRepository.deleteAll(commentRepository.findAll().stream()
            .sorted((a, b) -> Boolean.compare(a.getParent() == null, b.getParent() == null))
            .toList());
        postRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
    }

    @Test
    @DisplayName("다른 사용자의 게시글에 댓글을 작성하면 커밋 후 게시글 작성자의 알림이 저장된다")
    void createComment_savesNotificationForPostAuthor() {
        User postAuthor = saveUser("author");
        User commenter = saveUser("commenter");
        Post post = savePost(postAuthor);

        CommentResponse comment = commentService.createComment(post.getId(), new CommentCreateRequest("댓글"),
            commenter.getId());

        List<Notification> notifications = notificationRepository.findAll();
        assertEquals(1, notifications.size());
        Notification notification = notifications.get(0);
        assertEquals(postAuthor.getId(), notification.getRecipient().getId());
        assertEquals(commenter.getId(), notification.getActor().getId());
        assertEquals(NotificationType.COMMENT, notification.getType());
        assertEquals(post.getId(), notification.getPost().getId());
        assertEquals(comment.getId(), notification.getComment().getId());
    }

    @Test
    @DisplayName("답글을 작성하면 커밋 후 부모 댓글 작성자의 답글 알림이 저장된다")
    void createReply_savesNotificationForParentAuthor() {
        User postAuthor = saveUser("author");
        User replier = saveUser("replier");
        Post post = savePost(postAuthor);
        CommentResponse parent = commentService.createComment(post.getId(), new CommentCreateRequest("내 댓글"),
            postAuthor.getId());

        commentService.createComment(post.getId(), new CommentCreateRequest("답글", parent.getId()),
            replier.getId());

        List<Notification> notifications = notificationRepository.findAll();
        assertEquals(1, notifications.size());
        assertEquals(NotificationType.REPLY, notifications.get(0).getType());
        assertEquals(postAuthor.getId(), notifications.get(0).getRecipient().getId());
    }

    @Test
    @DisplayName("자기 게시글에 댓글을 작성하면 알림이 저장되지 않는다")
    void createComment_ownPost_noNotification() {
        User postAuthor = saveUser("author");
        Post post = savePost(postAuthor);

        commentService.createComment(post.getId(), new CommentCreateRequest("내 댓글"), postAuthor.getId());

        assertTrue(notificationRepository.findAll().isEmpty());
    }

    private User saveUser(String userId) {
        return userRepository.save(User.builder()
            .userId(userId)
            .email(userId + "@test.com")
            .password("pw")
            .name(userId)
            .active(true)
            .build());
    }

    private Post savePost(User user) {
        return postRepository.save(Post.builder()
            .user(user)
            .title("제목")
            .content("본문")
            .isPublic(true)
            .build());
    }
}
