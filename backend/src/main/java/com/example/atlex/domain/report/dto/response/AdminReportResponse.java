package com.example.atlex.domain.report.dto.response;

import com.example.atlex.domain.report.entity.Report;
import com.example.atlex.domain.report.entity.ReportReason;
import com.example.atlex.domain.report.entity.ReportStatus;
import com.example.atlex.domain.report.entity.ReportTargetType;
import com.example.atlex.domain.user.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 관리자 신고 목록·상세에 공통으로 사용하는 신고 정보 응답.
 */
@Schema(description = "관리자 신고 정보 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportResponse {

    @Schema(description = "신고 ID", example = "1")
    private Long id;
    @Schema(description = "신고 대상 종류", example = "COMMENT")
    private ReportTargetType targetType;
    @Schema(description = "신고 대상 ID", example = "3")
    private Long targetId;
    @Schema(description = "신고 사유", example = "SPAM")
    private ReportReason reason;
    @Schema(description = "추가 설명", example = "같은 광고 댓글을 반복해서 작성합니다.")
    private String description;
    @Schema(description = "처리 상태", example = "PENDING")
    private ReportStatus status;
    @Schema(description = "신고자 아이디", example = "john123")
    private String reporterUserId;
    @Schema(description = "신고자 닉네임", example = "홍길동")
    private String reporterName;
    @Schema(description = "처리 관리자 아이디", example = "admin")
    private String processedByUserId;
    @Schema(description = "처리 메모", example = "광고성 댓글로 확인되어 작성자에게 경고 조치")
    private String resultMemo;
    @Schema(description = "처리 일시", example = "2024-01-16T09:00:00")
    private LocalDateTime processedAt;
    @Schema(description = "신고 일시", example = "2024-01-15T10:30:00")
    private LocalDateTime createdAt;

    /**
     * 신고 엔티티를 관리자 응답으로 변환한다. 신고자와 처리자는 미리 로딩되어 있어야 한다.
     *
     * @param report 신고
     * @return 관리자 신고 응답
     */
    public static AdminReportResponse from(Report report) {
        User processedBy = report.getProcessedBy();
        return AdminReportResponse.builder()
            .id(report.getId())
            .targetType(report.getTargetType())
            .targetId(report.getTargetId())
            .reason(report.getReason())
            .description(report.getDescription())
            .status(report.getStatus())
            .reporterUserId(report.getReporter().getUserId())
            .reporterName(report.getReporter().getName())
            .processedByUserId(processedBy != null ? processedBy.getUserId() : null)
            .resultMemo(report.getResultMemo())
            .processedAt(report.getProcessedAt())
            .createdAt(report.getCreatedAt())
            .build();
    }
}
