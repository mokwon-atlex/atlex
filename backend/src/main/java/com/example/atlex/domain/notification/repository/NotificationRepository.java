package com.example.atlex.domain.notification.repository;

import com.example.atlex.domain.notification.entity.Notification;
import com.example.atlex.domain.notification.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 알림 조회·저장 Repository.
 */
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * 같은 원본 댓글로 같은 수신자에게 같은 종류의 알림이 이미 생성됐는지 확인한다.
     *
     * @param recipientId 수신자 DB ID
     * @param type 알림 종류
     * @param commentId 원본 댓글 ID
     * @return 이미 생성됐으면 true
     */
    boolean existsByRecipient_IdAndTypeAndComment_Id(Long recipientId, NotificationType type, Long commentId);
}
