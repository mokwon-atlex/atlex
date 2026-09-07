package com.example.atlex.domain.comment.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

public class CommentUpdateForbiddenException extends CustomException {
    public CommentUpdateForbiddenException() {
        super(ErrorCode.COMMENT_UPDATE_FORBIDDEN);
    }
}
