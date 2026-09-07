package com.example.atlex.domain.post.dto.response;

import com.example.atlex.domain.post.entity.Post;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Schema(description = "게시글 목록 아이템 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostSummaryResponse {

    @Schema(description = "게시글 ID", example = "1")
    private Long id;
    @Schema(description = "카테고리 ID", example = "2")
    private Long categoryId;
    @Schema(description = "카테고리명", example = "개발 노트")
    private String categoryName;
    @Schema(description = "제목", example = "Spring Boot 입문 가이드")
    private String title;
    @Schema(description = "요약 (description 없으면 content 앞 50자)", example = "Spring Boot를 처음 시작하는 분들을 위한 가이드입니다.")
    private String description;
    @Schema(description = "썸네일 URL", example = "https://example.com/images/thumbnail.jpg")
    private String thumbnailUrl;
    @Schema(description = "작성자 DB ID", example = "1")
    private Long authorId;
    @Schema(description = "작성자 아이디", example = "john123")
    private String authorUserId;
    @Schema(description = "작성자 닉네임", example = "홍길동")
    private String authorName;
    @Schema(description = "조회수", example = "42")
    private Integer hits;
    @Schema(description = "좋아요 수", example = "7")
    private Integer likes;
    @Schema(description = "작성일시", example = "2024-01-15T10:30:00")
    private LocalDateTime createdAt;

    public static PostSummaryResponse from(Post post) {
        return PostSummaryResponse.builder()
                .id(post.getId())
                .categoryId(post.getCategory() != null ? post.getCategory().getId() : null)
                .categoryName(post.getCategory() != null ? post.getCategory().getName() : null)
                .title(post.getTitle())
                .description(resolveListDescription(post.getDescription(), post.getContent()))
                .thumbnailUrl(post.getThumbnailUrl())
                .authorId(post.getUser().getId())
                .authorUserId(post.getUser().getUserId())
                .authorName(post.getUser().getName())
                .hits(post.getHits())
                .likes(post.getLikes())
                .createdAt(post.getCreatedAt())
                .build();
    }

    private static String resolveListDescription(String description, String content) {
        if (description != null && !description.isBlank()) {
            return description;
        }

        if (content == null || content.isBlank()) {
            return null;
        }

        return content.length() <= 50 ? content : content.substring(0, 50);
    }
}
