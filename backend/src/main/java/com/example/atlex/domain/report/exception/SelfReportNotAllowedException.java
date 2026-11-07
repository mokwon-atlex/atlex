package com.example.atlex.domain.report.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

/**
 * 본인이 작성한 게시물·댓글을 신고할 때 발생하는 예외.
 */
public class SelfReportNotAllowedException extends CustomException {
    public SelfReportNotAllowedException() {
        super(ErrorCode.SELF_REPORT_NOT_ALLOWED);
    }
}
