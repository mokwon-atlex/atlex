package com.example.atlex.domain.graph.keyword;

import com.example.atlex.domain.graph.keyword.entity.KeywordOccurrence;
import org.jsoup.Jsoup;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

@Component
public class KeywordExtractor {

    private static final Pattern SPLIT_PATTERN = Pattern.compile("[^\\p{IsAlphabetic}\\p{IsDigit}]+");

    public Map<String, KeywordOccurrence> extract(String title, String content, List<String> tags) {
        Map<String, MutableOccurrence> occurrences = new LinkedHashMap<>();
        addText(occurrences, title, Field.TITLE);
        addText(occurrences, toPlainText(content), Field.CONTENT);

        if (tags != null) {
            for (String tag : tags) {
                addText(occurrences, normalizeTag(tag), Field.TAG);
            }
        }

        Map<String, KeywordOccurrence> result = new LinkedHashMap<>();
        occurrences.forEach((keyword, occurrence) -> result.put(
            keyword,
            new KeywordOccurrence(keyword, occurrence.titleCount, occurrence.contentCount, occurrence.tagCount)));
        return result;
    }

    private void addText(Map<String, MutableOccurrence> occurrences, String text, Field field) {
        if (text == null || text.isBlank()) {
            return;
        }

        for (String rawToken : SPLIT_PATTERN.split(text.toLowerCase(Locale.ROOT))) {
            String token = rawToken.trim();
            if (token.length() < 2) {
                continue;
            }
            MutableOccurrence occurrence = occurrences.computeIfAbsent(token, ignored -> new MutableOccurrence());
            occurrence.increment(field);
        }
    }

    /**
     * 본문은 리치 텍스트 에디터가 저장한 HTML 이다.
     * 원문을 그대로 토큰화하면 div, class, href 같은 마크업이 키워드로 섞이므로 평문만 추출한다.
     *
     * @param html 게시글 본문 HTML
     * @return 태그와 엔티티를 제거한 평문. 입력이 비어 있으면 빈 문자열
     */
    private String toPlainText(String html) {
        if (html == null || html.isBlank()) {
            return "";
        }

        return Jsoup.parse(html).text();
    }

    private String normalizeTag(String tag) {
        if (tag == null) {
            return "";
        }
        return tag.trim().replaceFirst("^#+", "").trim();
    }

    private enum Field {
        TITLE,
        CONTENT,
        TAG
    }

    private static class MutableOccurrence {
        private int titleCount;
        private int contentCount;
        private int tagCount;

        private void increment(Field field) {
            if (field == Field.TITLE) {
                titleCount++;
            } else if (field == Field.CONTENT) {
                contentCount++;
            } else {
                tagCount++;
            }
        }
    }
}
