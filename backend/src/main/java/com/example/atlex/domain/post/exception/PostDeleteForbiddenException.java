package com.example.atlex.domain.post.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

public class PostDeleteForbiddenException extends CustomException {
    public PostDeleteForbiddenException() {
        super(ErrorCode.POST_DELETE_FORBIDDEN);
    }
}
