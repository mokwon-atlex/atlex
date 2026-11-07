package com.example.atlex.domain.notification.event;

import com.example.atlex.domain.comment.event.CommentCreatedEvent;
import com.example.atlex.domain.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * 다른 도메인의 활동 이벤트를 받아 알림을 생성하는 리스너.
 * 원본 활동이 커밋된 뒤에만 알림을 만들어, 롤백된 활동의 알림이 남지 않게 한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;

    /**
     * 댓글 작성 이벤트로 알림을 생성한다.
     * 알림 생성 실패가 이미 커밋된 댓글 작성 요청을 실패 응답으로 바꾸지 않도록 예외를 기록하고 종료한다.
     *
     * @param event 댓글 작성 이벤트
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCommentCreated(CommentCreatedEvent event) {
        try {
            notificationService.notifyCommentCreated(event);
        } catch (RuntimeException e) {
            log.warn("댓글 알림 생성 실패: commentId={}, actorId={}", event.commentId(), event.actorId(), e);
        }
    }
}
