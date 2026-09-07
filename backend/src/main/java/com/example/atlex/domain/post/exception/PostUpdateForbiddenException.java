package com.example.atlex.domain.post.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

public class PostUpdateForbiddenException extends CustomException {
    public PostUpdateForbiddenException() {
        super(ErrorCode.POST_UPDATE_FORBIDDEN);
    }
}
