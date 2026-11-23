package com.example.atlex.domain.user.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

/**
 * 이미 사용 중인 닉네임(name)일 때 발생하는 예외입니다.
 */
public class DuplicateNameException extends CustomException {

    public DuplicateNameException() {
        super(ErrorCode.DUPLICATE_NAME);
    }
}
