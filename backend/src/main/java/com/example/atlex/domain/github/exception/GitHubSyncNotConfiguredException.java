package com.example.atlex.domain.github.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

/**
 * GitHub 연동이 설정되지 않은 상태에서 동기화 작업을 수행하려 할 때 발생하는 예외입니다.
 */
public class GitHubSyncNotConfiguredException extends CustomException {

    public GitHubSyncNotConfiguredException() {
        super(ErrorCode.GITHUB_SYNC_NOT_CONFIGURED);
    }

    public GitHubSyncNotConfiguredException(String message) {
        super(ErrorCode.GITHUB_SYNC_NOT_CONFIGURED, message);
    }
}
