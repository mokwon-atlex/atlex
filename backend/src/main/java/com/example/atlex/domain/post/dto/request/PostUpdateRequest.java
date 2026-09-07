package com.example.atlex.domain.post.dto.request;

import com.example.atlex.global.validation.anotation.NullOrNotBlank;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "게시글 수정 요청 (수정할 필드만 전송)")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PostUpdateRequest {

    @Schema(description = "변경할 제목 (최대 200자, 선택)", example = "수정된 Spring Boot 가이드")
    @NullOrNotBlank(message = "제목은 공백일 수 없습니다.")
    @Size(max = 200, message = "제목은 200자 이하로 입력해주세요.")
    private String title;

    @Schema(description = "변경할 요약 설명 (최대 255자, 선택)", example = "수정된 요약 설명입니다.")
    @Size(max = 255, message = "설명은 255자 이하로 입력해주세요.")
    private String description;

    @Schema(description = "변경할 본문 (최대 5000자, 선택)", example = "수정된 본문 내용입니다.")
    @NullOrNotBlank(message = "내용은 공백일 수 없습니다.")
    @Size(max = 5000, message = "내용은 5000자 이하로 입력해주세요.")
    private String content;

    @Schema(description = "변경할 썸네일 URL (최대 255자, 선택)", example = "https://example.com/images/new_thumbnail.jpg")
    @Size(max = 255, message = "썸네일 URL은 255자 이하로 입력해주세요.")
    private String thumbnailUrl;

    @Schema(description = "변경할 카테고리 ID (선택)", example = "3")
    private Long categoryId;

    @Schema(description = "변경할 공개 여부 (선택)", example = "false")
    private Boolean isPublic;
}
