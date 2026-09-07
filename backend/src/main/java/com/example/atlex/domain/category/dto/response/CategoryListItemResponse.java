package com.example.atlex.domain.category.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "카테고리 목록 아이템")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryListItemResponse {

    @Schema(description = "카테고리 ID", example = "1")
    private Long id;
    @Schema(description = "카테고리 이름", example = "개발 노트")
    private String name;
    @Schema(description = "카테고리에 속한 게시글 수", example = "5")
    private Long postCount;
    @Schema(description = "카테고리 썸네일 URL", example = "https://example.com/images/category.jpg")
    private String thumbnailUrl;
}
