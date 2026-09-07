package com.example.atlex.domain.comment.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

public class CommentDeleteForbiddenException extends CustomException {
    public CommentDeleteForbiddenException() {
        super(ErrorCode.COMMENT_DELETE_FORBIDDEN);
    }
}
