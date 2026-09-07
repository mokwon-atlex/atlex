package com.example.atlex.domain.user.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

public class PrivacyNotAgreedException extends CustomException {
    public PrivacyNotAgreedException() {
        super(ErrorCode.PRIVACY_NOT_AGREED);
    }
}
