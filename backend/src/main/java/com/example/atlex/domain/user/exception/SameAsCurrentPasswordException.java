package com.example.atlex.domain.user.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

public class SameAsCurrentPasswordException extends CustomException {
    public SameAsCurrentPasswordException() {
        super(ErrorCode.SAME_AS_CURRENT_PASSWORD);
    }
}
