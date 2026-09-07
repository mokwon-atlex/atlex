package com.example.atlex.domain.user.dto.response;
//가입 완료 후 반환할 데이터(ID, 이메일 등)

import com.example.atlex.domain.user.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Schema(description = "사용자 정보 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    @Schema(description = "사용자 DB ID", example = "1")
    private Long id;
    @Schema(description = "로그인용 아이디", example = "john123")
    private String userId;
    @Schema(description = "이메일", example = "john@example.com")
    private String email;
    @Schema(description = "닉네임", example = "홍길동")
    private String name;
    @Schema(description = "계정 활성화 여부", example = "true")
    private Boolean active;
    @Schema(description = "마케팅 수신 동의 여부", example = "false")
    private Boolean marketingAgreed;
    @Schema(description = "생성일시", example = "2024-01-15T10:30:00")
    private LocalDateTime createdAt;
    @Schema(description = "수정일시", example = "2024-01-16T09:00:00")
    private LocalDateTime updatedAt;

    //Entity를 Response DTO로 변환하는 정적 팩토리 메서드
    public static UserResponse from(User user){
        return UserResponse.builder()
                .id(user.getId())
                .userId(user.getUserId())
                .email(user.getEmail())
                .name(user.getName())
                .active(user.getActive())
                .marketingAgreed(user.getMarketingAgreed())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt()) // 수정 전엔 null 또는 생성시간과 동일
                .build();
    }
}
