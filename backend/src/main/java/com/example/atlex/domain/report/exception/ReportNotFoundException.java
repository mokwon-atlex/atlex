package com.example.atlex.domain.report.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

/**
 * 존재하지 않는 신고를 조회하거나 처리할 때 발생하는 예외.
 */
public class ReportNotFoundException extends CustomException {
    public ReportNotFoundException() {
        super(ErrorCode.REPORT_NOT_FOUND);
    }
}
