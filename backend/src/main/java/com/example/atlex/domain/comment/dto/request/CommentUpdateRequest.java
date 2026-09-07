package com.example.atlex.domain.comment.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "댓글 수정 요청")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CommentUpdateRequest {

    @Schema(description = "수정할 댓글 내용 (최대 1000자)", example = "내용을 수정합니다.")
    @NotBlank(message = "댓글을 입력해주세요.")
    @Size(max = 1000, message = "댓글은 1000자 이하로 입력해주세요.")
    private String content;
}
