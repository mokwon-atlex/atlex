package com.example.atlex.global.health.controller;

import com.example.atlex.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import org.springframework.http.ResponseEntity;

/**
 * Health Check API Swagger 문서 인터페이스입니다.
 */
@Tag(name = "Health", description = "헬스 체크 관련 API")
public interface HealthControllerDocs {

    @Operation(summary = "헬스 체크", description = "애플리케이션의 정상 기동 여부를 확인합니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "정상 동작 중", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
            {
              "code": "SUCCESS",
              "message": null,
              "data": {
                "status": "UP"
              },
              "errors": null
            }""")))
    })
    ResponseEntity<ApiResponse<Map<String, String>>> checkHealth();
}
