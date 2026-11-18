package com.example.atlex.global.security.sanitizer;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class HtmlSanitizerTest {

    @Test
    void sanitizeRichText_removesXssVectorsWhileKeepingEditorMarkup() {
        String raw = """
            <h1>제목</h1>
            <script>alert('xss')</script>
            <img src="/api/v1/files/test.png" alt="사진.png" onerror="alert(1)">
            <img src="javascript:alert(2)" alt="bad">
            <a href="javascript:alert(3)" target="_blank">악성링크</a>
            <div data-type="math-block"><div class="post-editor-block__label">수식 (LaTeX)</div><pre class="post-editor-block__body"><code>E=mc^2</code></pre></div>
            """;

        String sanitized = HtmlSanitizer.sanitizeRichText(raw);

        assertThat(sanitized)
            .doesNotContain("<script>")
            .doesNotContain("onerror")
            .doesNotContain("javascript:")
            .contains("<h1>제목</h1>")
            .contains("src=\"/api/v1/files/test.png\"")
            .contains("data-type=\"math-block\"");
    }

    @Test
    void sanitizePlainText_stripsHtmlTagsAndPreservesNormalTextAndSqlLikeInput() {
        assertThat(HtmlSanitizer.sanitizePlainText("<script>alert(1)</script>제목 & 테스트"))
            .isEqualTo("제목 & 테스트");
        assertThat(HtmlSanitizer.sanitizePlainText("'; DROP TABLE posts; --"))
            .isEqualTo("'; DROP TABLE posts; --");
    }

    @Test
    void sanitizeImageUrl_allowsSafeHttpHttpsAndInternalFilesOnly() {
        assertThat(HtmlSanitizer.sanitizeImageUrl("/api/v1/files/abc.png"))
            .isEqualTo("/api/v1/files/abc.png");
        assertThat(HtmlSanitizer.sanitizeImageUrl("https://example.com/a.png"))
            .isEqualTo("https://example.com/a.png");
        assertThat(HtmlSanitizer.sanitizeImageUrl("javascript:alert(1)")).isNull();
        assertThat(HtmlSanitizer.sanitizeImageUrl("data:image/png;base64,AAAA")).isNull();
        assertThat(HtmlSanitizer.sanitizeImageUrl("/api/v1/files/../secret.txt")).isNull();
    }

    @Test
    void sanitizeTags_removesHtmlTagsAndFiltersBlankTags() {
        List<String> sanitized = HtmlSanitizer.sanitizeTags(List.of("<b>Java</b>", "<script>x</script>", "Spring"));

        assertThat(sanitized).containsExactly("Java", "Spring");
    }

    @Test
    void extractPlainText_stripsHtmlTagsForPreview() {
        String html = "<h1>#을 누르면 헤더1로 생성됩니다.</h1><p>본문 <strong>강조</strong></p>";

        assertThat(HtmlSanitizer.extractPlainText(html))
            .isEqualTo("#을 누르면 헤더1로 생성됩니다. 본문 강조");
    }

    @Test
    void extractPreviewText_excludesMathCodeTableAndToggleBlocks() {
        String html = """
            <h1>제목 텍스트</h1>
            <details data-type="details-block" open="open"><summary>토글 제목</summary><div><p>토글 내용</p></div></details>
            <table><tbody><tr><td>표 셀</td></tr></tbody></table>
            <pre><code>int a = 10;</code></pre>
            <div data-type="math-block"><div class="post-editor-block__label">수식 (LaTeX)</div><pre><code>E=mc^2</code></pre></div>
            <p>본문 요약 텍스트</p>
            """;

        assertThat(HtmlSanitizer.extractPreviewText(html))
            .isEqualTo("제목 텍스트 본문 요약 텍스트");
    }
}
