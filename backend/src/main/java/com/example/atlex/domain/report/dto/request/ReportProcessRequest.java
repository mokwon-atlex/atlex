package com.example.atlex.domain.report.dto.request;

import com.example.atlex.domain.report.entity.ReportStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 관리자 신고 처리 요청.
 */
@Schema(description = "신고 처리 요청")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ReportProcessRequest {

    /** 처리 결과 상태. RESOLVED 또는 REJECTED만 허용 */
    @Schema(description = "처리 결과 (RESOLVED: 조치 완료, REJECTED: 기각)", example = "RESOLVED")
    @NotNull(message = "처리 결과를 선택해주세요.")
    private ReportStatus status;

    /** 처리 메모 */
    @Schema(description = "처리 메모 (최대 500자)", example = "광고성 댓글로 확인되어 작성자에게 경고 조치")
    @NotBlank(message = "처리 메모를 입력해주세요.")
    @Size(max = 500, message = "처리 메모는 500자 이하로 입력해주세요.")
    private String resultMemo;
}
