package com.example.atlex.domain.post.dto.response;

import com.example.atlex.domain.post.entity.Post;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Schema(description = "게시글 상세 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {

    @Schema(description = "게시글 ID", example = "1")
    private Long id;
    @Schema(description = "카테고리 ID (없으면 null)", example = "2")
    private Long categoryId;
    @Schema(description = "게시글 제목", example = "Spring Boot 입문 가이드")
    private String title;
    @Schema(description = "요약 설명 (목록 표시용)", example = "Spring Boot를 처음 시작하는 분들을 위한 가이드입니다.")
    private String description;
    @Schema(description = "게시글 본문", example = "## 시작하기\nSpring Boot는...")
    private String content;
    @Schema(description = "썸네일 이미지 URL", example = "https://example.com/images/thumbnail.jpg")
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
    @Schema(description = "공개 여부 (false면 본인만 조회 가능)", example = "true")
    private Boolean isPublic;
    @Schema(description = "작성일시", example = "2024-01-15T10:30:00")
    private LocalDateTime createdAt;
    @Schema(description = "수정일시", example = "2024-01-16T09:00:00")
    private LocalDateTime updatedAt;

    public static PostResponse from(Post post) {
        return PostResponse.builder()
            .id(post.getId())
            .categoryId(post.getCategory() != null ? post.getCategory().getId() : null)
            .title(post.getTitle())
            .description(post.getDescription())
            .content(post.getContent())
            .thumbnailUrl(post.getThumbnailUrl())
            .authorId(post.getUser().getId())
            .authorUserId(post.getUser().getUserId())
            .authorName(post.getUser().getName())
            .hits(post.getHits())
            .likes(post.getLikes())
            .isPublic(post.getIsPublic())
            .createdAt(post.getCreatedAt())
            .updatedAt(post.getUpdatedAt())
            .build();
    }
}
