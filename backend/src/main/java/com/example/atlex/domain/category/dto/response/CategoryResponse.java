package com.example.atlex.domain.category.dto.response;

import com.example.atlex.domain.category.entity.Category;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "카테고리 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    @Schema(description = "카테고리 ID", example = "1")
    private Long id;
    @Schema(description = "카테고리 이름", example = "개발 노트")
    private String name;

    public static CategoryResponse from(Category category) {
        return CategoryResponse.builder()
            .id(category.getId())
            .name(category.getName())
            .build();
    }
}
