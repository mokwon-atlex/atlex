package com.example.atlex.global.exception.common;

import com.example.atlex.global.exception.error.ErrorCode;
import com.example.atlex.global.exception.error.ErrorData;
import com.example.atlex.global.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. @Valid 유효성 검사 실패 시 (@NotBlank, @Size 등)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException e) {
        List<ErrorData> errors = e.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(fieldError -> ErrorData.field(
                fieldError.getDefaultMessage(),
                fieldError.getField(),
                fieldError.getRejectedValue()))
            .collect(Collectors.toList());

        return ResponseEntity
            .status(ErrorCode.VALIDATION_ERROR.getStatus())
            .body(ApiResponse.fail(ErrorCode.VALIDATION_ERROR, errors));
    }

    // 3. @RequestParam 누락
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingParam(MissingServletRequestParameterException e) {
        List<ErrorData> errors = List.of(
            ErrorData.field("필수 파라미터가 누락되었습니다.", e.getParameterName(), null));
        return ResponseEntity
            .status(ErrorCode.VALIDATION_ERROR.getStatus())
            .body(ApiResponse.fail(ErrorCode.VALIDATION_ERROR, errors));
    }

    // 4. @PathVariable / @RequestParam 타입 불일치
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException e) {
        List<ErrorData> errors = List.of(
            ErrorData.field("파라미터 타입이 올바르지 않습니다.", e.getName(), e.getValue()));
        return ResponseEntity
            .status(ErrorCode.VALIDATION_ERROR.getStatus())
            .body(ApiResponse.fail(ErrorCode.VALIDATION_ERROR, errors));
    }

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponse<Void>> handleCustomException(CustomException e) {
        return ResponseEntity
            .status(e.getErrorCode().getStatus())
            .body(ApiResponse.fail(e.getErrorCode(), e.getMessage(), e.getErrors()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("Unhandled exception", e);
        ErrorCode errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
        return ResponseEntity
            .status(errorCode.getStatus())
            .body(ApiResponse.fail(errorCode));
    }
}
