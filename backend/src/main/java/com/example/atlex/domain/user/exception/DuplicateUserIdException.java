package com.example.atlex.domain.user.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

public class DuplicateUserIdException extends CustomException {
    public DuplicateUserIdException() {
        super(ErrorCode.DUPLICATE_USER_ID);
    }
}
