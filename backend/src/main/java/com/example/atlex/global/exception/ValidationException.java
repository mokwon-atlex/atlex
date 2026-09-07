package com.example.atlex.global.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

public class ValidationException extends CustomException {
    public ValidationException() {
        super(ErrorCode.VALIDATION_ERROR);
    }

    public ValidationException(String message) {
        super(ErrorCode.VALIDATION_ERROR, message);
    }
}