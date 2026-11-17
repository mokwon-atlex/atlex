package com.example.atlex.domain.follow.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

/**
 * 자기 자신을 팔로우하거나 언팔로우하려 할 때 발생하는 예외.
 */
public class SelfFollowNotAllowedException extends CustomException {
    public SelfFollowNotAllowedException() {
        super(ErrorCode.SELF_FOLLOW_NOT_ALLOWED);
    }
}
