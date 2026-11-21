package com.example.atlex.domain.notification;

import com.example.atlex.domain.comment.entity.Comment;
import com.example.atlex.domain.comment.event.CommentCreatedEvent;
import com.example.atlex.domain.comment.service.CommentReader;
import com.example.atlex.domain.follow.event.UserFollowedEvent;
import com.example.atlex.domain.notification.entity.Notification;
import com.example.atlex.domain.notification.entity.NotificationSetting;
import com.example.atlex.domain.notification.entity.NotificationType;
import com.example.atlex.domain.notification.repository.NotificationRepository;
import com.example.atlex.domain.notification.repository.NotificationSettingRepository;
import com.example.atlex.domain.notification.service.NotificationService;
import com.example.atlex.domain.notification.service.NotificationSseService;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.event.PostLikedEvent;
import com.example.atlex.domain.post.service.PostReader;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.service.UserReader;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    NotificationRepository notificationRepository;
    @Mock
    NotificationSettingRepository notificationSettingRepository;
    @Mock
    UserReader userReader;
    @Mock
    PostReader postReader;
    @Mock
    CommentReader commentReader;
    @Mock
    NotificationSseService notificationSseService;

    @InjectMocks
    NotificationService notificationService;

    private static final Long POST_ID = 10L;
    private static final Long COMMENT_ID = 100L;

    private User user(Long id) {
        return User.builder().id(id).userId("user" + id).build();
    }

    /**
     * 알림 저장에 필요한 수신자·행동자·원본 자원 참조를 준비한다.
     */
    private void stubReferences(User recipient, User actor, Post post, Comment comment) {
        when(userReader.getReferenceById(recipient.getId())).thenReturn(recipient);
        when(userReader.getReferenceById(actor.getId())).thenReturn(actor);
        when(postReader.getReferenceById(POST_ID)).thenReturn(post);
        when(commentReader.getReferenceById(COMMENT_ID)).thenReturn(comment);
    }

    private Notification captureSavedNotification() {
        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        return captor.getValue();
    }

    @Test
    @DisplayName("다른 사용자의 게시글에 댓글을 작성하면 게시글 작성자에게 원본을 연결한 댓글 알림을 생성한다")
    void notifyCommentCreated_comment_notifiesPostAuthor() {
        User postAuthor = user(1L);
        User commenter = user(2L);
        Post post = Post.builder().id(POST_ID).user(postAuthor).build();
        Comment comment = Comment.builder().id(COMMENT_ID).post(post).user(commenter).build();
        stubReferences(postAuthor, commenter, post, comment);

        notificationService.notifyCommentCreated(new CommentCreatedEvent(COMMENT_ID, POST_ID, 2L, 1L, null));

        Notification notification = captureSavedNotification();
        assertSame(postAuthor, notification.getRecipient());
        assertSame(commenter, notification.getActor());
        assertEquals(NotificationType.COMMENT, notification.getType());
        assertSame(post, notification.getPost());
        assertSame(comment, notification.getComment());
        assertFalse(notification.getIsRead());
    }

    @Test
    @DisplayName("답글을 작성하면 게시글 작성자가 아닌 부모 댓글 작성자에게 답글 알림을 생성한다")
    void notifyCommentCreated_reply_notifiesParentAuthor() {
        User parentAuthor = user(2L);
        User replier = user(3L);
        Post post = Post.builder().id(POST_ID).build();
        Comment reply = Comment.builder().id(COMMENT_ID).post(post).user(replier).build();
        stubReferences(parentAuthor, replier, post, reply);

        notificationService.notifyCommentCreated(new CommentCreatedEvent(COMMENT_ID, POST_ID, 3L, 1L, 2L));

        Notification notification = captureSavedNotification();
        assertSame(parentAuthor, notification.getRecipient());
        assertEquals(NotificationType.REPLY, notification.getType());
    }

    @Test
    @DisplayName("자기 게시글에 댓글을 작성하면 알림을 생성하지 않는다")
    void notifyCommentCreated_ownPost_skipped() {
        notificationService.notifyCommentCreated(new CommentCreatedEvent(COMMENT_ID, POST_ID, 1L, 1L, null));

        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    @DisplayName("자기 댓글에 답글을 작성하면 게시글 작성자가 달라도 알림을 생성하지 않는다")
    void notifyCommentCreated_ownCommentReply_skipped() {
        notificationService.notifyCommentCreated(new CommentCreatedEvent(COMMENT_ID, POST_ID, 2L, 1L, 2L));

        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    @DisplayName("같은 댓글의 알림이 이미 있으면 중복 생성하지 않는다")
    void notifyCommentCreated_duplicate_skipped() {
        when(notificationRepository.existsByRecipient_IdAndTypeAndComment_Id(1L, NotificationType.COMMENT,
            COMMENT_ID)).thenReturn(true);

        notificationService.notifyCommentCreated(new CommentCreatedEvent(COMMENT_ID, POST_ID, 2L, 1L, null));

        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    @DisplayName("알림이 저장되면 수신자에게 SSE 알림 이벤트를 전송한다")
    void notifyCommentCreated_sendsSseEvent() {
        User postAuthor = user(1L);
        User commenter = user(2L);
        Post post = Post.builder().id(POST_ID).title("테스트 글").user(postAuthor).build();
        Comment comment = Comment.builder().id(COMMENT_ID).post(post).user(commenter).content("새 댓글").build();
        stubReferences(postAuthor, commenter, post, comment);
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        notificationService.notifyCommentCreated(new CommentCreatedEvent(COMMENT_ID, POST_ID, 2L, 1L, null));

        verify(notificationSseService).sendNotification(eq(1L), any());
    }

    @Test
    @DisplayName("다른 사용자가 게시글에 좋아요를 누르면 좋아요 알림을 생성하고 SSE로 전송한다")
    void notifyPostLiked_createsAndSendsSse() {
        User postAuthor = user(1L);
        User liker = user(2L);
        Post post = Post.builder().id(POST_ID).title("좋아요 테스트 글").user(postAuthor).build();
        when(userReader.getReferenceById(1L)).thenReturn(postAuthor);
        when(userReader.getReferenceById(2L)).thenReturn(liker);
        when(postReader.getReferenceById(POST_ID)).thenReturn(post);
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        notificationService.notifyPostLiked(new PostLikedEvent(POST_ID, 2L, 1L));

        Notification saved = captureSavedNotification();
        assertEquals(NotificationType.LIKE, saved.getType());
        verify(notificationSseService).sendNotification(eq(1L), any());
    }

    @Test
    @DisplayName("다른 사용자가 팔로우하면 팔로우 알림을 생성하고 SSE로 전송한다")
    void notifyUserFollowed_createsAndSendsSse() {
        User target = user(1L);
        User follower = user(2L);
        when(userReader.getReferenceById(1L)).thenReturn(target);
        when(userReader.getReferenceById(2L)).thenReturn(follower);
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        notificationService.notifyUserFollowed(new UserFollowedEvent(2L, 1L));

        Notification saved = captureSavedNotification();
        assertEquals(NotificationType.FOLLOW, saved.getType());
        verify(notificationSseService).sendNotification(eq(1L), any());
    }

    @Test
    @DisplayName("서비스 공지 발송 시 공지 알림 설정이 켜진 활성 사용자에게만 공지 알림을 전송한다")
    void notifyServiceNotice_respectsNoticeSetting() {
        User admin = user(1L);
        User enabledUser = user(2L);
        User disabledUser = user(3L);
        when(userReader.getReferenceById(1L)).thenReturn(admin);
        when(userReader.findAllActiveUsers()).thenReturn(List.of(admin, enabledUser, disabledUser));
        when(notificationSettingRepository.findAllByUser_IdIn(List.of(2L, 3L)))
            .thenReturn(List.of(NotificationSetting.builder().user(disabledUser).noticeEnabled(false).build()));
        when(notificationRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        int sentCount = notificationService.notifyServiceNotice(1L, null);

        assertEquals(1, sentCount);
        verify(notificationSseService).sendNotification(eq(2L), any());
        verify(notificationSseService, never()).sendNotification(eq(3L), any());
    }
}
