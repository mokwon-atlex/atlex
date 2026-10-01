package com.example.atlex.domain.report.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

/**
 * 처리 결과로 허용되지 않는 상태를 지정했을 때 발생하는 예외.
 */
public class InvalidReportStatusException extends CustomException {
    public InvalidReportStatusException() {
        super(ErrorCode.INVALID_REPORT_STATUS);
    }
}
