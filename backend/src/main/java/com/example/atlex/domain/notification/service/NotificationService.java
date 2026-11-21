package com.example.atlex.domain.notification.service;

import com.example.atlex.domain.comment.event.CommentCreatedEvent;
import com.example.atlex.domain.comment.service.CommentReader;
import com.example.atlex.domain.follow.event.UserFollowedEvent;
import com.example.atlex.domain.notification.dto.request.NotificationSettingUpdateRequest;
import com.example.atlex.domain.notification.dto.response.NotificationResponse;
import com.example.atlex.domain.notification.dto.response.NotificationSettingResponse;
import com.example.atlex.domain.notification.entity.Notification;
import com.example.atlex.domain.notification.entity.NotificationSetting;
import com.example.atlex.domain.notification.entity.NotificationType;
import com.example.atlex.domain.notification.exception.NotificationAccessDeniedException;
import com.example.atlex.domain.notification.exception.NotificationNotFoundException;
import com.example.atlex.domain.notification.repository.NotificationRepository;
import com.example.atlex.domain.notification.repository.NotificationSettingRepository;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.event.PostLikedEvent;
import com.example.atlex.domain.post.service.PostReader;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.service.UserReader;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 사용자 활동에 대한 서비스 내부 알림 생성 규칙을 담당한다.
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationSettingRepository notificationSettingRepository;
    private final UserReader userReader;
    private final PostReader postReader;
    private final CommentReader commentReader;
    private final NotificationSseService notificationSseService;

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

        boolean commentEnabled = notificationSettingRepository.findByUser_Id(recipientId)
            .map(NotificationSetting::isCommentEnabled)
            .orElse(true);
        if (!commentEnabled) {
            return;
        }

        Notification saved = notificationRepository.save(Notification.builder()
            .recipient(userReader.getReferenceById(recipientId))
            .actor(userReader.getReferenceById(event.actorId()))
            .type(type)
            .post(postReader.getReferenceById(event.postId()))
            .comment(commentReader.getReferenceById(event.commentId()))
            .build());
        if (saved != null) {
            notificationSseService.sendNotification(recipientId, NotificationResponse.from(saved));
        }
    }

    /**
     * 게시글 좋아요에 대한 알림을 생성하고 실시간 SSE 이벤트를 전송한다.
     *
     * @param event 게시글 좋아요 이벤트
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notifyPostLiked(PostLikedEvent event) {
        Long recipientId = event.postAuthorId();
        if (recipientId == null || recipientId.equals(event.actorId())
            || notificationRepository.existsByRecipient_IdAndTypeAndActor_IdAndPost_Id(
                recipientId,
                NotificationType.LIKE,
                event.actorId(),
                event.postId())) {
            return;
        }

        boolean likeEnabled = notificationSettingRepository.findByUser_Id(recipientId)
            .map(NotificationSetting::isLikeEnabled)
            .orElse(true);
        if (!likeEnabled) {
            return;
        }

        Notification saved = notificationRepository.save(Notification.builder()
            .recipient(userReader.getReferenceById(recipientId))
            .actor(userReader.getReferenceById(event.actorId()))
            .type(NotificationType.LIKE)
            .post(postReader.getReferenceById(event.postId()))
            .build());
        if (saved != null) {
            notificationSseService.sendNotification(recipientId, NotificationResponse.from(saved));
        }
    }

    /**
     * 새 팔로워에 대한 알림을 생성하고 실시간 SSE 이벤트를 전송한다.
     *
     * @param event 사용자 팔로우 이벤트
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notifyUserFollowed(UserFollowedEvent event) {
        Long recipientId = event.followingId();
        if (recipientId == null || recipientId.equals(event.followerId())
            || notificationRepository.existsByRecipient_IdAndTypeAndActor_Id(
                recipientId,
                NotificationType.FOLLOW,
                event.followerId())) {
            return;
        }

        boolean followEnabled = notificationSettingRepository.findByUser_Id(recipientId)
            .map(NotificationSetting::isFollowEnabled)
            .orElse(true);
        if (!followEnabled) {
            return;
        }

        Notification saved = notificationRepository.save(Notification.builder()
            .recipient(userReader.getReferenceById(recipientId))
            .actor(userReader.getReferenceById(event.followerId()))
            .type(NotificationType.FOLLOW)
            .build());
        if (saved != null) {
            notificationSseService.sendNotification(recipientId, NotificationResponse.from(saved));
        }
    }

    /**
     * 서비스 공지 알림을 공지 수신이 활성화된 전체 활성 사용자에게 발송한다.
     *
     * @param adminUserId 발송 관리자 ID
     * @param postId 연결할 공지 게시글 ID (선택)
     * @return 발송된 알림 수
     */
    @Transactional
    public int notifyServiceNotice(Long adminUserId, Long postId) {
        Post noticePost = postId != null ? postReader.getReferenceById(postId) : null;
        User adminUser = userReader.getReferenceById(adminUserId);
        List<User> recipients = userReader.findAllActiveUsers().stream()
            .filter(user -> !Objects.equals(user.getId(), adminUserId))
            .toList();
        if (recipients.isEmpty()) {
            return 0;
        }

        List<Long> recipientIds = recipients.stream().map(User::getId).toList();
        Map<Long, Boolean> noticeEnabledByUserId = notificationSettingRepository.findAllByUser_IdIn(recipientIds)
            .stream()
            .collect(Collectors.toMap(
                setting -> setting.getUser().getId(),
                NotificationSetting::isNoticeEnabled,
                (first, ignored) -> first));

        List<Notification> toSave = new ArrayList<>();
        for (User recipient : recipients) {
            if (!noticeEnabledByUserId.getOrDefault(recipient.getId(), true)) {
                continue;
            }
            toSave.add(Notification.builder()
                .recipient(recipient)
                .actor(adminUser)
                .type(NotificationType.NOTICE)
                .post(noticePost)
                .build());
        }

        if (toSave.isEmpty()) {
            return 0;
        }

        List<Notification> savedNotifications = notificationRepository.saveAll(toSave);
        for (Notification saved : savedNotifications) {
            notificationSseService.sendNotification(saved.getRecipient().getId(), NotificationResponse.from(saved));
        }
        return savedNotifications.size();
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(Long recipientId, Pageable pageable) {
        return notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(recipientId, pageable)
            .map(NotificationResponse::from);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long recipientId) {
        return notificationRepository.countByRecipient_IdAndIsReadFalse(recipientId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long recipientId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(NotificationNotFoundException::new);

        if (!Objects.equals(notification.getRecipient().getId(), recipientId)) {
            throw new NotificationAccessDeniedException();
        }

        notification.markAsRead();
    }

    @Transactional
    public void markAllAsRead(Long recipientId) {
        notificationRepository.markAllAsReadByRecipientId(recipientId);
    }

    @Transactional(readOnly = true)
    public NotificationSettingResponse getNotificationSettings(Long userId) {
        return notificationSettingRepository.findByUser_Id(userId)
            .map(NotificationSettingResponse::from)
            .orElseGet(NotificationSettingResponse::defaults);
    }

    @Transactional
    public NotificationSettingResponse updateNotificationSettings(
        Long userId,
        NotificationSettingUpdateRequest request) {
        NotificationSetting setting = notificationSettingRepository.findByUser_Id(userId)
            .orElseGet(() -> notificationSettingRepository.save(
                NotificationSetting.defaultFor(userReader.getReferenceById(userId))));

        setting.update(
            request.getCommentEnabled(),
            request.getLikeEnabled(),
            request.getFollowEnabled(),
            request.getNoticeEnabled());

        return NotificationSettingResponse.from(setting);
    }

    @Transactional
    public void deleteNotification(Long notificationId, Long recipientId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(NotificationNotFoundException::new);

        if (!Objects.equals(notification.getRecipient().getId(), recipientId)) {
            throw new NotificationAccessDeniedException();
        }

        notificationRepository.delete(notification);
    }

    @Transactional
    public void deleteAllNotifications(Long recipientId) {
        notificationRepository.deleteAllByRecipientId(recipientId);
    }
}
