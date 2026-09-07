package com.example.atlex.domain.auth.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

import java.util.List;

public class AuthenticationException extends CustomException {
    public AuthenticationException() {
        super(ErrorCode.AUTHENTICATION_ERROR, "아이디 또는 비밀번호가 올바르지 않습니다.", List.of());
    }
}
