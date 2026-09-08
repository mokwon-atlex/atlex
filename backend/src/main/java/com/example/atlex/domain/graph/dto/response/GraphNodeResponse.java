package com.example.atlex.domain.graph.dto.response;

import com.example.atlex.domain.post.entity.Post;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Schema(description = "그래프 노드")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraphNodeResponse {

    @Schema(description = "게시글 ID", example = "1")
    private Long id;
    @Schema(description = "게시글 제목", example = "Spring Boot 입문")
    private String title;
    @Schema(description = "작성자 DB ID", example = "1")
    private Long authorId;
    @Schema(description = "작성자 아이디", example = "john123")
    private String authorUserId;
    @Schema(description = "작성자 닉네임", example = "홍길동")
    private String authorName;
    @Schema(description = "카테고리 ID", example = "2")
    private Long categoryId;
    @Schema(description = "카테고리명", example = "개발")
    private String categoryName;
    @Schema(description = "공개 여부", example = "true")
    private Boolean isPublic;
    @Schema(description = "태그 목록")
    private List<String> tags;

    public static GraphNodeResponse from(Post post, List<String> tags) {
        return GraphNodeResponse.builder()
            .id(post.getId())
            .title(post.getTitle())
            .authorId(post.getUser().getId())
            .authorUserId(post.getUser().getUserId())
            .authorName(post.getUser().getName())
            .categoryId(post.getCategory() != null ? post.getCategory().getId() : null)
            .categoryName(post.getCategory() != null ? post.getCategory().getName() : null)
            .isPublic(post.getIsPublic())
            .tags(tags)
            .build();
    }
}
