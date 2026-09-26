package com.example.atlex.domain.report.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

/**
 * 이미 처리가 끝난 신고를 다시 처리할 때 발생하는 예외.
 */
public class ReportAlreadyProcessedException extends CustomException {
    public ReportAlreadyProcessedException() {
        super(ErrorCode.REPORT_ALREADY_PROCESSED);
    }
}
