package com.example.atlex.domain.github.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

/**
 * GitHub OAuth 인가 및 토큰 교환에 실패했을 때 발생하는 예외입니다.
 */
public class GitHubOAuthFailedException extends CustomException {

    public GitHubOAuthFailedException() {
        super(ErrorCode.GITHUB_OAUTH_FAILED);
    }

    public GitHubOAuthFailedException(String message) {
        super(ErrorCode.GITHUB_OAUTH_FAILED, message);
    }
}
