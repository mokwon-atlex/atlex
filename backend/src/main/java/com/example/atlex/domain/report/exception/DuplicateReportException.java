package com.example.atlex.domain.report.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

/**
 * 동일 사용자가 같은 대상을 다시 신고할 때 발생하는 예외.
 */
public class DuplicateReportException extends CustomException {
    public DuplicateReportException() {
        super(ErrorCode.DUPLICATE_REPORT);
    }
}
