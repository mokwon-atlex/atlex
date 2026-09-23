package com.example.atlex.domain.github.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

/**
 * GitHub REST API 통신 중 오류가 발생했을 때 발생하는 예외입니다.
 */
public class GitHubApiException extends CustomException {

    public GitHubApiException() {
        super(ErrorCode.GITHUB_API_ERROR);
    }

    public GitHubApiException(String message) {
        super(ErrorCode.GITHUB_API_ERROR, message);
    }
}
