package com.example.atlex.domain.auth.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

public class TooManyLoginAttemptsException extends CustomException {
    public TooManyLoginAttemptsException() {
        super(ErrorCode.TOO_MANY_LOGIN_ATTEMPTS);
    }
}
