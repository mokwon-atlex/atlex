package com.example.atlex.domain.report.dto.request;

import com.example.atlex.domain.report.entity.ReportReason;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 게시물·댓글 신고 접수 요청.
 */
@Schema(description = "신고 접수 요청")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ReportCreateRequest {

    /** 신고 사유 */
    @Schema(description = "신고 사유", example = "SPAM")
    @NotNull(message = "신고 사유를 선택해주세요.")
    private ReportReason reason;

    /** 추가 설명. 사유가 OTHER이면 필수 */
    @Schema(description = "추가 설명 (최대 500자, 사유가 OTHER이면 필수)", example = "같은 광고 댓글을 반복해서 작성합니다.")
    @Size(max = 500, message = "추가 설명은 500자 이하로 입력해주세요.")
    private String description;
}
