package com.example.atlex.domain.github.util;

import com.example.atlex.domain.post.entity.Post;

import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 게시글 메타데이터를 YAML Frontmatter 규격의 마크다운 파일로 생성하고 파싱하는 유틸리티입니다.
 */
public final class FrontmatterUtils {

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private FrontmatterUtils() {}

    /**
     * 게시글 엔티티와 태그 목록을 바탕으로 YAML Frontmatter가 포함된 마크다운 문자열을 생성합니다.
     *
     * @param post 게시글 엔티티
     * @param tags 태그 목록
     * @return Frontmatter를 포함한 전체 마크다운 텍스트
     */
    public static String buildMarkdown(Post post, List<String> tags) {
        StringBuilder sb = new StringBuilder();
        sb.append("---\n");
        sb.append("title: \"").append(escapeYaml(post.getTitle())).append("\"\n");

        if (post.getDescription() != null && !post.getDescription().isBlank()) {
            sb.append("description: \"").append(escapeYaml(post.getDescription())).append("\"\n");
        }

        if (post.getCategory() != null) {
            sb.append("category: \"").append(escapeYaml(post.getCategory().getName())).append("\"\n");
        }

        if (tags != null && !tags.isEmpty()) {
            sb.append("tags:\n");
            for (String tag : tags) {
                if (tag != null && !tag.isBlank()) {
                    sb.append("  - \"").append(escapeYaml(tag.trim())).append("\"\n");
                }
            }
        }

        if (post.getThumbnailUrl() != null && !post.getThumbnailUrl().isBlank()) {
            sb.append("thumbnail: \"").append(escapeYaml(post.getThumbnailUrl())).append("\"\n");
        }

        if (post.getCreatedAt() != null) {
            sb.append("date: ").append(post.getCreatedAt().format(ISO_FORMATTER)).append("\n");
        }

        if (post.getIsPublic() != null) {
            sb.append("isPublic: ").append(post.getIsPublic()).append("\n");
        }

        sb.append("---\n\n");

        String content = post.getContent() != null ? post.getContent() : "";
        // CRLF를 LF로 정규화
        content = content.replace("\r\n", "\n");
        sb.append(content);
        if (!content.endsWith("\n")) {
            sb.append("\n");
        }

        return sb.toString();
    }

    /**
     * 파일 시스템 및 GitHub 저장소 경로에 안전한 마크다운 파일명을 생성합니다.
     * 예: "123-spring-boot-guide.md"
     *
     * @param postId 게시글 ID
     * @param title 게시글 제목
     * @return 안전한 마크다운 파일명
     */
    public static String generateSafeFilename(Long postId, String title) {
        String safeTitle = title != null ? title.trim() : "post";
        // 알파벳, 숫자, 한글, 점, 언더스코어, 대시 외 모든 특수문자 및 공백을 대시(-)로 치환
        safeTitle = safeTitle.replaceAll("[^a-zA-Z0-9가-힣._-]+", "-");
        // 연속된 대시 정리 및 앞뒤 대시 제거
        safeTitle = safeTitle.replaceAll("-{2,}", "-").replaceAll("^-|-$", "");
        if (safeTitle.length() > 50) {
            safeTitle = safeTitle.substring(0, 50).replaceAll("-$", "");
        }
        if (safeTitle.isBlank()) {
            safeTitle = "untitled";
        }
        return postId + "-" + safeTitle + ".md";
    }

    private static String escapeYaml(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
