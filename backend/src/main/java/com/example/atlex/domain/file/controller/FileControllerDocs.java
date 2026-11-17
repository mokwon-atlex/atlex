package com.example.atlex.domain.file.controller;

import com.example.atlex.domain.file.dto.response.FileUploadResponse;
import com.example.atlex.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "File", description = "에디터 이미지 및 첨부파일 API")
public interface FileControllerDocs {

    @Operation(summary = "이미지 파일 업로드", description = "에디터에 삽입할 이미지 파일(jpg, png, gif, webp)을 업로드합니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "업로드 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "빈 파일 또는 지원하지 않는 이미지 형식"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 필요")
    })
    ResponseEntity<ApiResponse<FileUploadResponse>> uploadImage(
        @Parameter(description = "업로드할 이미지 파일") @RequestParam("file")
        MultipartFile file);

    @Operation(summary = "첨부파일 업로드", description = "게시글에 첨부할 일반 파일을 업로드합니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "업로드 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "빈 파일 또는 차단된 파일 형식"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 필요")
    })
    ResponseEntity<ApiResponse<FileUploadResponse>> uploadFile(
        @Parameter(description = "업로드할 첨부파일") @RequestParam("file")
        MultipartFile file);

    @Operation(summary = "업로드 파일 조회", description = "업로드된 이미지 또는 첨부파일을 조회/다운로드합니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "파일 없음")
    })
    ResponseEntity<Resource> getFile(
        @Parameter(description = "저장된 파일명", example = "a1b2c3d4.png") @PathVariable
        String storedName);
}
