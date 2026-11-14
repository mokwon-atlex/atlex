package com.example.atlex.global.health.controller;

import com.example.atlex.global.response.ApiResponse;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 애플리케이션 상태 확인(Health Check) 컨트롤러입니다.
 */
@RestController
@RequestMapping("/api/v1/health")
public class HealthController implements HealthControllerDocs {

    /**
     * 애플리케이션의 정상 기동 및 헬스 상태를 반환합니다.
     *
     * @return 헬스 상태 응답
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> checkHealth() {
        return ResponseEntity.ok(ApiResponse.success(Map.of("status", "UP")));
    }
}
