package com.example.atlex.domain.file.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "파일 업로드 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponse {

    @Schema(description = "접근 URL", example = "/api/v1/files/a1b2c3d4.png")
    private String url;

    @Schema(description = "원본 파일명", example = "diagram.png")
    private String originalName;

    @Schema(description = "저장된 파일명", example = "a1b2c3d4.png")
    private String storedName;

    @Schema(description = "콘텐츠 타입", example = "image/png")
    private String contentType;

    @Schema(description = "파일 크기(바이트)", example = "12345")
    private long size;

    @Schema(description = "이미지 파일 여부", example = "true")
    private boolean image;
}
