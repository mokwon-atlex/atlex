package com.example.atlex.domain.notification.service;

import com.example.atlex.domain.comment.event.CommentCreatedEvent;
import com.example.atlex.domain.comment.repository.CommentRepository;
import com.example.atlex.domain.notification.entity.Notification;
import com.example.atlex.domain.notification.entity.NotificationType;
import com.example.atlex.domain.notification.repository.NotificationRepository;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * 사용자 활동에 대한 서비스 내부 알림 생성 규칙을 담당한다.
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    /**
     * 댓글 작성에 대한 알림을 생성한다.
     * 최상위 댓글은 게시물 작성자에게, 답글은 부모 댓글 작성자에게 알리며 자기 행동과 중복 알림은 생성하지 않는다.
     * 댓글 트랜잭션이 커밋된 뒤 호출되므로 별도 트랜잭션에서 저장한다.
     *
     * @param event 댓글 작성 이벤트
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notifyCommentCreated(CommentCreatedEvent event) {
        NotificationType type = event.isReply() ? NotificationType.REPLY : NotificationType.COMMENT;
        Long recipientId = event.isReply() ? event.parentAuthorId() : event.postAuthorId();

        if (recipientId.equals(event.actorId())
            || notificationRepository.existsByRecipient_IdAndTypeAndComment_Id(recipientId, type,
                event.commentId())) {
            return;
        }

        notificationRepository.save(Notification.builder()
            .recipient(userRepository.getReferenceById(recipientId))
            .actor(userRepository.getReferenceById(event.actorId()))
            .type(type)
            .post(postRepository.getReferenceById(event.postId()))
            .comment(commentRepository.getReferenceById(event.commentId()))
            .build());
    }
}
