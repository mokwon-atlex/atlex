package com.example.atlex.domain.report.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

/**
 * 기타 사유로 신고하면서 추가 설명을 입력하지 않았을 때 발생하는 예외.
 */
public class ReportDescriptionRequiredException extends CustomException {
    public ReportDescriptionRequiredException() {
        super(ErrorCode.REPORT_DESCRIPTION_REQUIRED);
    }
}
