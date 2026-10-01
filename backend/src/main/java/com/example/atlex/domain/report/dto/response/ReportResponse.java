package com.example.atlex.domain.report.dto.response;

import com.example.atlex.domain.report.entity.Report;
import com.example.atlex.domain.report.entity.ReportReason;
import com.example.atlex.domain.report.entity.ReportStatus;
import com.example.atlex.domain.report.entity.ReportTargetType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 신고 접수 결과 응답.
 */
@Schema(description = "신고 접수 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {

    @Schema(description = "신고 ID", example = "1")
    private Long id;
    @Schema(description = "신고 대상 종류", example = "POST")
    private ReportTargetType targetType;
    @Schema(description = "신고 대상 ID", example = "10")
    private Long targetId;
    @Schema(description = "신고 사유", example = "SPAM")
    private ReportReason reason;
    @Schema(description = "처리 상태", example = "PENDING")
    private ReportStatus status;
    @Schema(description = "신고 일시", example = "2024-01-15T10:30:00")
    private LocalDateTime createdAt;

    /**
     * 신고 엔티티를 접수 응답으로 변환한다.
     *
     * @param report 신고
     * @return 접수 응답
     */
    public static ReportResponse from(Report report) {
        return ReportResponse.builder()
            .id(report.getId())
            .targetType(report.getTargetType())
            .targetId(report.getTargetId())
            .reason(report.getReason())
            .status(report.getStatus())
            .createdAt(report.getCreatedAt())
            .build();
    }
}
