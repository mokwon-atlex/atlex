package com.example.atlex.global.security.sanitizer;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.parser.Parser;
import org.jsoup.safety.Safelist;

import java.net.URI;
import java.util.List;

/**
 * 게시글 본문 HTML과 일반 텍스트, 이미지 URL에서 XSS 위험 요소를 제거하는 정제 유틸리티.
 */
public final class HtmlSanitizer {

    private static final Safelist RICH_TEXT_SAFELIST = createRichTextSafelist();
    private static final Document.OutputSettings PRESERVE_WHITESPACE_OUTPUT = new Document.OutputSettings()
        .prettyPrint(false);

    private HtmlSanitizer() {}

    private static Safelist createRichTextSafelist() {
        return new Safelist()
            .addTags(
                "p", "br", "strong", "b", "em", "i", "u", "s", "del",
                "h1", "h2", "h3", "blockquote", "ul", "ol", "li",
                "pre", "code", "hr", "a", "img",
                "details", "summary", "div", "section", "span",
                "table", "thead", "tbody", "tr", "th", "td", "colgroup", "col",
                "input")
            .addAttributes("a", "href", "target", "rel", "download", "data-file-attachment")
            .addAttributes("code", "class")
            .addAttributes("col", "style")
            .addAttributes("details", "data-type", "open", "style")
            .addAttributes("div", "data-type", "style", "class")
            .addAttributes("h1", "style")
            .addAttributes("h2", "style")
            .addAttributes("h3", "style")
            .addAttributes("img", "src", "alt", "title", "width", "height")
            .addAttributes("input", "type", "checked", "disabled")
            .addAttributes("li", "data-type", "data-checked", "style")
            .addAttributes("ol", "start", "style")
            .addAttributes("p", "data-type", "style")
            .addAttributes("pre", "class")
            .addAttributes("section", "data-type", "style")
            .addAttributes("span", "class")
            .addAttributes("summary", "style", "class")
            .addAttributes("table", "style")
            .addAttributes("td", "colspan", "rowspan", "style")
            .addAttributes("th", "colspan", "rowspan", "style")
            .addAttributes("ul", "data-type", "style")
            .addProtocols("a", "href", "http", "https", "mailto", "tel")
            .addProtocols("img", "src", "http", "https")
            .preserveRelativeLinks(true);
    }

    /**
     * TipTap 리치 텍스트 본문 HTML에서 스크립트, 이벤트 핸들러, 위험 스킴을 제거한다.
     *
     * @param html 원본 본문 HTML
     * @return 정제된 안전한 HTML
     */
    public static String sanitizeRichText(String html) {
        if (html == null) {
            return null;
        }
        return Jsoup.clean(html, "https://atlex.local", RICH_TEXT_SAFELIST, PRESERVE_WHITESPACE_OUTPUT);
    }

    /**
     * 일반 텍스트 필드(제목, 설명, 태그 등)에서 모든 HTML 태그를 제거한다.
     *
     * @param text 원본 텍스트
     * @return HTML 태그가 제거된 순수 텍스트
     */
    public static String sanitizePlainText(String text) {
        if (text == null) {
            return null;
        }
        String cleaned = Jsoup.clean(text, "", Safelist.none(), PRESERVE_WHITESPACE_OUTPUT);
        return Parser.unescapeEntities(cleaned, false).trim();
    }

    /**
     * 태그 문자열 목록에서 HTML 태그를 제거하고 빈 항목을 제외한다.
     *
     * @param tags 원본 태그 목록
     * @return 정제된 태그 목록
     */
    public static List<String> sanitizeTags(List<String> tags) {
        if (tags == null) {
            return null;
        }
        return tags.stream()
            .map(HtmlSanitizer::sanitizePlainText)
            .filter(tag -> tag != null && !tag.isBlank())
            .toList();
    }

    /**
     * 썸네일 등 이미지 URL이 안전한 스킴(http, https) 또는 내부 파일 경로(/api/v1/files/)인지 검증한다.
     *
     * @param url 원본 이미지 URL
     * @return 안전하면 정규화된 URL, 그렇지 않으면 null
     */
    public static String sanitizeImageUrl(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        String trimmed = url.trim();
        if (trimmed.startsWith("/api/v1/files/") && !trimmed.contains("..")
            && !trimmed.chars().anyMatch(Character::isWhitespace)) {
            return trimmed;
        }
        try {
            URI uri = URI.create(trimmed);
            String scheme = uri.getScheme();
            if (scheme != null && (scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https"))) {
                return trimmed;
            }
        } catch (IllegalArgumentException ignored) {
            return null;
        }
        return null;
    }

    /**
     * HTML 본문에서 카드 미리보기 등에 사용할 순수 텍스트만 추출한다.
     *
     * @param html 원본 HTML 또는 일반 텍스트
     * @return 태그가 제거된 순수 텍스트
     */
    public static String extractPlainText(String html) {
        if (html == null || html.isBlank()) {
            return "";
        }
        return Jsoup.parse(html).text().trim();
    }
}
