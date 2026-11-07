package com.example.atlex.domain.report.entity;

import com.example.atlex.domain.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 게시물·댓글 신고와 관리자 처리 결과.
 * 신고 대상은 종류와 ID로 식별하며, 동일 사용자의 동일 대상 중복 신고는 unique 제약으로 차단한다.
 * 처리 결과(상태·처리자·메모·시각)는 한 번 기록되면 변경하지 않으므로 신고 행 자체가 처리 이력이 된다.
 */
@Entity
@Table(name = "reports", uniqueConstraints = @UniqueConstraint(name = "uk_reports_reporter_target", columnNames = {
    "reporter_id", "target_type",
    "target_id"}), indexes = @Index(name = "idx_reports_status_created", columnList = "status, created_at"))
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EntityListeners(AuditingEntityListener.class)
public class Report {

    /** 신고 ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 신고한 사용자 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    /** 신고 대상 종류 */
    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private ReportTargetType targetType;

    /** 신고 대상 ID(게시물 ID 또는 댓글 ID) */
    @Column(name = "target_id", nullable = false)
    private Long targetId;

    /** 신고 사유 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportReason reason;

    /** 신고자가 입력한 추가 설명 */
    @Column(length = 500)
    private String description;

    /** 처리 상태 */
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportStatus status = ReportStatus.PENDING;

    /** 신고를 처리한 관리자 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;

    /** 관리자가 남긴 처리 메모 */
    @Column(length = 500)
    private String resultMemo;

    /** 처리 일시 */
    private LocalDateTime processedAt;

    /** 신고 일시 */
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    /**
     * 신고가 아직 처리되지 않았는지 확인한다.
     *
     * @return 접수 상태이면 true
     */
    public boolean isPending() {
        return status == ReportStatus.PENDING;
    }

    /**
     * 관리자 처리 결과를 기록한다.
     * 상태 전환 가능 여부는 호출하는 서비스에서 먼저 검증한다.
     *
     * @param admin 처리한 관리자
     * @param resultStatus 처리 결과 상태(조치 완료 또는 기각)
     * @param memo 처리 메모
     */
    public void process(User admin, ReportStatus resultStatus, String memo) {
        this.status = resultStatus;
        this.processedBy = admin;
        this.resultMemo = memo;
        this.processedAt = LocalDateTime.now();
    }
}
