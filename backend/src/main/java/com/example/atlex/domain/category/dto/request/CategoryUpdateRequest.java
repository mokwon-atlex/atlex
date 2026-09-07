package com.example.atlex.domain.category.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "카테고리 수정 요청")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryUpdateRequest {

    @Schema(description = "변경할 카테고리 이름 (최대 100자)", example = "개발 일지")
    @NotBlank(message = "카테고리 이름을 입력해주세요.")
    @Size(max = 100, message = "카테고리 이름은 100자 이하로 입력해주세요.")
    private String name;
}
