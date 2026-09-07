package com.example.atlex.domain.user.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

public class TermsNotAgreedException extends CustomException {
    public TermsNotAgreedException() {
        super(ErrorCode.TERMS_NOT_AGREED);
    }
}
