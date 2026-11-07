package com.example.atlex.domain.tag.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "플랫폼 전체 태그 항목")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformTagItemResponse {

    @Schema(description = "태그 이름", example = "Spring Boot")
    private String name;

    @Schema(description = "해당 태그의 공개 게시글 수", example = "42")
    private Long postCount;
}
