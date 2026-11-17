package com.example.atlex.domain.file;

import com.example.atlex.domain.file.dto.response.FileUploadResponse;
import com.example.atlex.domain.file.service.FileService;
import com.example.atlex.domain.file.service.FileService.LoadedFile;
import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FileServiceTest {

    @TempDir
    Path tempDir;

    @Test
    @DisplayName("이미지 업로드 시 저장 후 접근 URL과 이미지 메타데이터를 반환하고 다시 조회할 수 있다")
    void storeAndLoadImage() throws Exception {
        FileService fileService = new FileService(tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "sample.png",
            "image/png",
            "png-content".getBytes(StandardCharsets.UTF_8));

        FileUploadResponse response = fileService.store(file, true);

        assertTrue(response.getUrl().startsWith("/api/v1/files/"));
        assertTrue(response.getStoredName().endsWith(".png"));
        assertEquals("sample.png", response.getOriginalName());
        assertTrue(response.isImage());

        LoadedFile loaded = fileService.load(response.getStoredName());
        assertTrue(loaded.inlineImage());
        assertTrue(loaded.resource().exists());
    }

    @Test
    @DisplayName("이미지 전용 업로드에 실행/HTML 파일을 전달하면 예외가 발생한다")
    void rejectNonImageForImageUpload() {
        FileService fileService = new FileService(tempDir.toString());
        MockMultipartFile htmlFile = new MockMultipartFile(
            "file",
            "bad.html",
            "text/html",
            "<script>alert(1)</script>".getBytes(StandardCharsets.UTF_8));

        CustomException exception = assertThrows(CustomException.class, () -> fileService.store(htmlFile, true));
        assertEquals(ErrorCode.INVALID_FILE_TYPE, exception.getErrorCode());
    }

    @Test
    @DisplayName("일반 첨부파일 업로드 시 차단된 확장자가 아니면 저장되며 inlineImage는 false다")
    void storePdfAttachment() {
        FileService fileService = new FileService(tempDir.toString());
        MockMultipartFile pdfFile = new MockMultipartFile(
            "file",
            "guide.pdf",
            "application/pdf",
            "pdf-content".getBytes(StandardCharsets.UTF_8));

        FileUploadResponse response = fileService.store(pdfFile, false);
        LoadedFile loaded = fileService.load(response.getStoredName());

        assertFalse(response.isImage());
        assertFalse(loaded.inlineImage());
    }

    @Test
    @DisplayName("경로 이탈 문자열이 포함된 파일 조회는 FILE_NOT_FOUND 예외를 발생시킨다")
    void rejectPathTraversalOnLoad() {
        FileService fileService = new FileService(tempDir.toString());

        CustomException exception = assertThrows(CustomException.class, () -> fileService.load("../secret.txt"));
        assertEquals(ErrorCode.FILE_NOT_FOUND, exception.getErrorCode());
    }
}
