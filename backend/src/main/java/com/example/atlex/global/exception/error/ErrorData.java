package com.example.atlex.global.exception.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@Getter
@RequiredArgsConstructor
public class ErrorData {
    private final String message;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private final Object data;

    public static ErrorData of(String message) {
        return new ErrorData(message, null);
    }

    public static ErrorData of(String message, Object data) {
        return new ErrorData(message, data);
    }

    // ====== field ======
    public static ErrorData field(String message, String key, Object value) {
        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("key", key);
        data.put("value", value);
        return new ErrorData(message, data);
    }
}
