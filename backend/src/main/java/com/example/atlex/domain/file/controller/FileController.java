package com.example.atlex.domain.file.controller;

import com.example.atlex.domain.file.dto.response.FileUploadResponse;
import com.example.atlex.domain.file.service.FileService;
import com.example.atlex.domain.file.service.FileService.LoadedFile;
import com.example.atlex.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController implements FileControllerDocs {

    private final FileService fileService;

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadImage(
        @RequestParam("file")
        MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(fileService.store(file, true)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadFile(
        @RequestParam("file")
        MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(fileService.store(file, false)));
    }

    @GetMapping("/{storedName:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable
    String storedName) {
        LoadedFile loadedFile = fileService.load(storedName);
        ContentDisposition disposition = loadedFile.inlineImage()
            ? ContentDisposition.inline().build()
            : ContentDisposition.attachment()
                .filename(loadedFile.filename(), StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
            .contentType(loadedFile.mediaType())
            .cacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic())
            .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
            .header("X-Content-Type-Options", "nosniff")
            .body(loadedFile.resource());
    }
}
