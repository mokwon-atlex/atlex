package com.example.atlex.global.response;

import com.example.atlex.global.exception.error.ErrorCode;
import com.example.atlex.global.exception.error.ErrorData;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Schema(description = "공통 API 응답 래퍼")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    @Schema(description = "응답 코드. 성공 시 'SUCCESS', 실패 시 ErrorCode명", example = "SUCCESS")
    private String code;

    @Schema(description = "응답 메시지. 성공 시 설명 또는 null", example = "로그인 성공")
    private String message;

    @JsonInclude(JsonInclude.Include.ALWAYS)
    private T data;

    @Schema(description = "유효성 검증 오류 목록. 정상 응답 시 null")
    @JsonInclude(JsonInclude.Include.ALWAYS)
    private List<ErrorData> errors;

    // 성공 응답
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .code("SUCCESS")
                .message(null)
                .data(data)
                .errors(null)
                .build();
    }

    // 성공 응답 (메시지 포함)
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .code("SUCCESS")
                .message(message)
                .data(data)
                .errors(null)
                .build();
    }

    // 실패 응답 (ErrorCode 기반 - GlobalExceptionHandler 검증 예외용)
    public static ApiResponse<Void> fail(ErrorCode errorCode) {
        return ApiResponse.<Void>builder()
                .code(errorCode.name())
                .message(errorCode.getMessage())
                .data(null)
                .errors(null)
                .build();
    }

    public static ApiResponse<Void> fail(ErrorCode errorCode, List<ErrorData> errors) {
        return ApiResponse.<Void>builder()
                .code(errorCode.name())
                .message(errorCode.getMessage())
                .data(null)
                .errors(errors.isEmpty() ? null : errors)
                .build();
    }

    // 비즈니스 예외용 - ErrorCode의 code/status를 쓰되 메시지는 예외에서 재정의
    public static ApiResponse<Void> fail(ErrorCode errorCode, String message, List<ErrorData> errors) {
        return ApiResponse.<Void>builder()
                .code(errorCode.name())
                .message(message)
                .data(null)
                .errors(errors.isEmpty() ? null : errors)
                .build();
    }
}
