package com.example.atlex.domain.auth.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

public class AccountDisabledException extends CustomException {
    public AccountDisabledException() {
        super(ErrorCode.ACCOUNT_DISABLED);
    }
}
