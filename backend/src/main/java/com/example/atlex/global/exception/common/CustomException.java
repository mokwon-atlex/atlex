package com.example.atlex.global.exception.common;

import com.example.atlex.global.exception.error.ErrorCode;
import com.example.atlex.global.exception.error.ErrorData;
import lombok.Getter;

import java.util.List;

@Getter
public class CustomException extends RuntimeException {
    private final ErrorCode errorCode;
    private final List<ErrorData> errors;

    protected CustomException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.errors = List.of();
    }

    protected CustomException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.errors = List.of();
    }

    protected CustomException(ErrorCode errorCode, ErrorData data) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.errors = List.of(data);
    }

    protected CustomException(ErrorCode errorCode, List<ErrorData> data) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.errors = data;
    }

    protected CustomException(ErrorCode errorCode, String message, List<ErrorData> data) {
        super(message);
        this.errorCode = errorCode;
        this.errors = data;
    }
}
