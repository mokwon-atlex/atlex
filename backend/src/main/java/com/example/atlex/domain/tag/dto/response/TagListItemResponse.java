package com.example.atlex.domain.tag.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "태그 목록 아이템")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TagListItemResponse {
    @Schema(description = "태그 ID", example = "1")
    private Long id;
    @Schema(description = "태그명", example = "Spring Boot")
    private String name;
    @Schema(description = "태그에 속한 게시글 수", example = "3")
    private Long postCount;
    @Schema(description = "태그 썸네일 URL", example = "https://example.com/images/tag.jpg")
    private String thumbnailUrl;
}
