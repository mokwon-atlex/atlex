package com.example.atlex.domain.report.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 관리자 신고 상세 응답. 신고 정보와 신고 대상 콘텐츠 요약을 함께 제공한다.
 */
@Schema(description = "관리자 신고 상세 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportDetailResponse {

    @Schema(description = "신고 정보")
    private AdminReportResponse report;

    @Schema(description = "신고 대상 콘텐츠 요약. 대상 데이터가 존재하지 않으면 null")
    private ReportTargetResponse target;
}
