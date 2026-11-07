package com.example.atlex.domain.comment.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "댓글 작성 요청")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CommentCreateRequest {

    @Schema(description = "댓글 내용 (최대 1000자)", example = "좋은 글 감사합니다!")
    @NotBlank(message = "댓글을 입력해주세요.")
    @Size(max = 1000, message = "댓글은 1000자 이하로 입력해주세요.")
    private String content;

    /**
     * 답글을 작성할 최상위 댓글 ID. 최상위 댓글을 작성할 때는 null이다.
     */
    @Schema(description = "답글을 작성할 부모 댓글 ID (최상위 댓글 작성 시 생략)", example = "1", nullable = true)
    private Long parentId;

    /**
     * 최상위 댓글 작성 요청을 생성한다.
     *
     * @param content 댓글 내용
     */
    public CommentCreateRequest(String content) {
        this(content, null);
    }
}
