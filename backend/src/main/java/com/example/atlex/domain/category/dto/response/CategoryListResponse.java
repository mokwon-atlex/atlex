package com.example.atlex.domain.category.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Schema(description = "카테고리 목록 응답 (커서 기반 페이지네이션)")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryListResponse {

    @Schema(description = "카테고리 목록")
    private List<CategoryListItemResponse> content;
    @Schema(description = "다음 페이지 존재 여부", example = "false")
    private boolean hasNext;
    @Schema(description = "다음 페이지 커서 ID (hasNext=true일 때만 유효)", example = "5")
    private Long nextCursor;
}
