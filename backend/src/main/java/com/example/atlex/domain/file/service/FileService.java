package com.example.atlex.domain.file.service;

import com.example.atlex.domain.file.dto.response.FileUploadResponse;
import com.example.atlex.domain.file.exception.FileStorageException;
import com.example.atlex.global.exception.InternalServerErrorException;
import com.example.atlex.global.exception.error.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * 에디터에서 업로드한 이미지와 첨부파일을 로컬 저장소에 저장하고 조회한다.
 */
@Service
public class FileService {

    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp");
    private static final Set<String> ALLOWED_IMAGE_MIME_TYPES = Set.of(
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp");
    private static final Set<String> BLOCKED_FILE_EXTENSIONS = Set.of(
        "exe", "bat", "cmd", "sh", "ps1", "msi", "dll", "jar", "html", "htm", "svg", "js", "mjs");

    private final Path uploadRoot;

    public FileService(@Value("${file.upload-dir:./uploads}")
    String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public FileUploadResponse store(MultipartFile file, boolean imageOnly) {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException(ErrorCode.FILE_EMPTY);
        }

        String originalName = sanitizeOriginalFilename(file.getOriginalFilename());
        String extension = extractExtension(originalName);
        String contentType = normalizeContentType(file.getContentType());

        validateFileType(extension, contentType, imageOnly);

        String storedName = extension.isEmpty()
            ? UUID.randomUUID().toString()
            : UUID.randomUUID() + "." + extension;

        try {
            Files.createDirectories(uploadRoot);
            Path targetPath = resolveSafePath(storedName);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new InternalServerErrorException();
        }

        boolean isImage = ALLOWED_IMAGE_EXTENSIONS.contains(extension)
            || ALLOWED_IMAGE_MIME_TYPES.contains(contentType);

        return FileUploadResponse.builder()
            .url("/api/v1/files/" + storedName)
            .originalName(originalName)
            .storedName(storedName)
            .contentType(contentType)
            .size(file.getSize())
            .image(isImage)
            .build();
    }

    public LoadedFile load(String storedName) {
        if (!StringUtils.hasText(storedName)
            || storedName.contains("/")
            || storedName.contains("\\")
            || storedName.contains("..")) {
            throw new FileStorageException(ErrorCode.FILE_NOT_FOUND);
        }

        try {
            Path targetPath = resolveSafePath(storedName);
            if (!Files.exists(targetPath) || !Files.isRegularFile(targetPath)) {
                throw new FileStorageException(ErrorCode.FILE_NOT_FOUND);
            }

            Resource resource = new UrlResource(targetPath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new FileStorageException(ErrorCode.FILE_NOT_FOUND);
            }

            String detectedContentType = Files.probeContentType(targetPath);
            MediaType mediaType = parseMediaType(detectedContentType);
            String extension = extractExtension(storedName);
            boolean inlineImage = ALLOWED_IMAGE_EXTENSIONS.contains(extension);

            return new LoadedFile(resource, mediaType, storedName, inlineImage);
        } catch (MalformedURLException e) {
            throw new FileStorageException(ErrorCode.FILE_NOT_FOUND);
        } catch (IOException e) {
            throw new InternalServerErrorException();
        }
    }

    private Path resolveSafePath(String storedName) {
        Path resolved = uploadRoot.resolve(storedName).normalize();
        if (!resolved.startsWith(uploadRoot)) {
            throw new FileStorageException(ErrorCode.FILE_NOT_FOUND);
        }
        return resolved;
    }

    private void validateFileType(String extension, String contentType, boolean imageOnly) {
        if (imageOnly) {
            boolean validExtension = ALLOWED_IMAGE_EXTENSIONS.contains(extension);
            boolean validMime = ALLOWED_IMAGE_MIME_TYPES.contains(contentType);
            if (!validExtension || !validMime) {
                throw new FileStorageException(ErrorCode.INVALID_FILE_TYPE);
            }
            return;
        }

        if (BLOCKED_FILE_EXTENSIONS.contains(extension)) {
            throw new FileStorageException(ErrorCode.INVALID_FILE_TYPE);
        }
    }

    private String sanitizeOriginalFilename(String rawFilename) {
        String cleaned = StringUtils.cleanPath(rawFilename == null ? "" : rawFilename);
        int lastSlash = Math.max(cleaned.lastIndexOf('/'), cleaned.lastIndexOf('\\'));
        String baseName = lastSlash >= 0 ? cleaned.substring(lastSlash + 1) : cleaned;
        return StringUtils.hasText(baseName) ? baseName : "file";
    }

    private String extractExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }

    private String normalizeContentType(String contentType) {
        if (!StringUtils.hasText(contentType)) {
            return MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
        return contentType.toLowerCase(Locale.ROOT);
    }

    private MediaType parseMediaType(String detectedContentType) {
        if (!StringUtils.hasText(detectedContentType)) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
        try {
            return MediaType.parseMediaType(detectedContentType);
        } catch (IllegalArgumentException e) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }

    public record LoadedFile(
        Resource resource,
        MediaType mediaType,
        String filename,
        boolean inlineImage) {
    }
}
