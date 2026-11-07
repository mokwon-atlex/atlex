package com.example.atlex.domain.report.dto.response;

import com.example.atlex.domain.comment.entity.Comment;
import com.example.atlex.domain.post.entity.Post;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 관리자가 신고 내용을 판단할 수 있도록 제공하는 신고 대상 콘텐츠 요약.
 */
@Schema(description = "신고 대상 콘텐츠 요약")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportTargetResponse {

    /** 미리보기 최대 길이 */
    private static final int PREVIEW_MAX_LENGTH = 200;

    @Schema(description = "대상이 속한 게시물 ID (댓글이면 부모 게시물)", example = "10")
    private Long postId;
    @Schema(description = "대상이 속한 게시물의 작성자 아이디 (게시물 상세 링크 생성용)", example = "writer1")
    private String postAuthorUserId;
    @Schema(description = "대상 작성자 아이디", example = "writer1")
    private String authorUserId;
    @Schema(description = "대상 작성자 닉네임", example = "작성자")
    private String authorName;
    @Schema(description = "게시물 제목 또는 댓글 내용 미리보기 (최대 200자)", example = "무료 쿠폰 받아가세요")
    private String preview;
    @Schema(description = "대상이 삭제되었는지 여부", example = "false")
    private boolean deleted;

    /**
     * 게시물을 신고 대상 요약으로 변환한다.
     *
     * @param post 게시물
     * @return 신고 대상 요약
     */
    public static ReportTargetResponse from(Post post) {
        return ReportTargetResponse.builder()
            .postId(post.getId())
            .postAuthorUserId(post.getUser().getUserId())
            .authorUserId(post.getUser().getUserId())
            .authorName(post.getUser().getName())
            .preview(truncate(post.getTitle()))
            .deleted(Boolean.TRUE.equals(post.getIsDeleted()))
            .build();
    }

    /**
     * 댓글을 신고 대상 요약으로 변환한다.
     *
     * @param comment 댓글
     * @return 신고 대상 요약
     */
    public static ReportTargetResponse from(Comment comment) {
        return ReportTargetResponse.builder()
            .postId(comment.getPost().getId())
            .postAuthorUserId(comment.getPost().getUser().getUserId())
            .authorUserId(comment.getUser().getUserId())
            .authorName(comment.getUser().getName())
            .preview(truncate(comment.getContent()))
            .deleted(
                Boolean.TRUE.equals(comment.getIsDeleted()) || Boolean.TRUE.equals(comment.getPost().getIsDeleted()))
            .build();
    }

    private static String truncate(String text) {
        if (text == null || text.length() <= PREVIEW_MAX_LENGTH) {
            return text;
        }
        return text.substring(0, PREVIEW_MAX_LENGTH);
    }
}
