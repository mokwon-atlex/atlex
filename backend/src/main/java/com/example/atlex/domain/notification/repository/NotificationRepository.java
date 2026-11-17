package com.example.atlex.domain.notification.repository;

import com.example.atlex.domain.notification.entity.Notification;
import com.example.atlex.domain.notification.entity.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @EntityGraph(attributePaths = {"actor", "post", "post.user", "comment"})
    Page<Notification> findByRecipient_IdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    long countByRecipient_IdAndIsReadFalse(Long recipientId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient.id = :recipientId AND n.isRead = false")
    int markAllAsReadByRecipientId(@Param("recipientId")
    Long recipientId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Notification n WHERE n.recipient.id = :recipientId")
    int deleteAllByRecipientId(@Param("recipientId")
    Long recipientId);
}
