package com.example.atlex.domain.comment.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

/**
 * 답글에 다시 답글을 작성해 1단계 깊이 제한을 넘을 때 발생하는 예외.
 */
public class CommentReplyDepthExceededException extends CustomException {
    public CommentReplyDepthExceededException() {
        super(ErrorCode.COMMENT_REPLY_DEPTH_EXCEEDED);
    }
}
