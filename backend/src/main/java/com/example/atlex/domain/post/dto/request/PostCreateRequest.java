package com.example.atlex.domain.post.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "게시글 작성 요청")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PostCreateRequest {

    @Schema(description = "제목 (최대 200자)", example = "Spring Boot 입문 가이드")
    @NotBlank(message = "제목을 입력해주세요.")
    @Size(max = 200, message = "제목은 200자 이하로 입력해주세요.")
    private String title;

    @Schema(description = "요약 설명 (최대 255자, 선택)", example = "Spring Boot를 처음 시작하는 분들을 위한 가이드입니다.")
    @Size(max = 255, message = "설명은 255자 이하로 입력해주세요.")
    private String description;

    @Schema(description = "본문 (최대 5000자)", example = "## 시작하기\nSpring Boot는 Java 기반 웹 프레임워크입니다...")
    @NotBlank(message = "내용을 입력해주세요.")
    @Size(max = 5000, message = "내용은 5000자 이하로 입력해주세요.")
    private String content;

    @Schema(description = "썸네일 이미지 URL (최대 255자, 선택)", example = "https://example.com/images/thumbnail.jpg")
    @Size(max = 255, message = "썸네일 URL은 255자 이하로 입력해주세요.")
    private String thumbnailUrl;

    @Schema(description = "카테고리 ID (선택, 없으면 null)", example = "2")
    private Long categoryId;

    @Schema(description = "공개 여부 (기본값 true)", example = "true")
    private Boolean isPublic;
}
