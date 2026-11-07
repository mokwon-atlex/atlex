package com.example.atlex.domain.ai.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

public class TooManyAiRequestsException extends CustomException {

    public TooManyAiRequestsException() {
        super(ErrorCode.TOO_MANY_AI_REQUESTS);
    }
}
