package com.example.atlex.domain.github.util;

import com.example.atlex.domain.category.entity.Category;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class FrontmatterUtilsTest {

    @Test
    @DisplayName("게시글 정보와 태그를 바탕으로 올바른 YAML Frontmatter를 생성한다")
    void buildMarkdownSuccess() {
        // given
        User user = User.builder().userId("tester").build();
        Category category = Category.builder().name("기술/Spring").build();
        Post post = Post.builder()
            .user(user)
            .category(category)
            .title("Spring Boot 4 동기화 가이드")
            .description("GitHub 연동 및 백업을 위한 완벽한 가이드입니다.")
            .content("## 본문 시작\n내용이 여기에 들어갑니다.")
            .isPublic(true)
            .build();

        List<String> tags = List.of("Spring", "GitHub", "Backup");

        // when
        String markdown = FrontmatterUtils.buildMarkdown(post, tags);

        // then
        assertThat(markdown).startsWith("---\n");
        assertThat(markdown).contains("title: \"Spring Boot 4 동기화 가이드\"");
        assertThat(markdown).contains("description: \"GitHub 연동 및 백업을 위한 완벽한 가이드입니다.\"");
        assertThat(markdown).contains("category: \"기술/Spring\"");
        assertThat(markdown).contains("tags:\n  - \"Spring\"\n  - \"GitHub\"\n  - \"Backup\"");
        assertThat(markdown).contains("isPublic: true");
        assertThat(markdown).contains("---\n\n## 본문 시작\n내용이 여기에 들어갑니다.");
    }

    @Test
    @DisplayName("썸네일 URL이 있는 경우 Frontmatter에 thumbnail이 포함된다")
    void buildMarkdownWithThumbnail() {
        // given
        User user = User.builder().userId("tester").build();
        Post post = Post.builder()
            .user(user)
            .title("썸네일 테스트 글")
            .content("내용")
            .thumbnailUrl("https://image.atlex.com/thumb.png")
            .isPublic(true)
            .build();

        // when
        String markdown = FrontmatterUtils.buildMarkdown(post, List.of());

        // then
        assertThat(markdown).contains("thumbnail: \"https://image.atlex.com/thumb.png\"");
    }

    @Test
    @DisplayName("특수문자가 포함된 제목이라도 안전한 파일명을 생성한다")
    void generateSafeFilenameSuccess() {
        // given
        Long postId = 42L;
        String rawTitle = "Spring Boot 4: 어떻게 연동할까? (feat. GitHub/백업!)";

        // when
        String filename = FrontmatterUtils.generateSafeFilename(postId, rawTitle);

        // then
        assertThat(filename).startsWith("42-");
        assertThat(filename).endsWith(".md");
        assertThat(filename).doesNotContain(":", "?", "/", "\\", "(", ")", " ");
    }

    @Test
    @DisplayName("제목이나 설명에 개행 문자 및 Frontmatter 구분선 주입 시도가 있어도 한 줄 내에서 이스케이프된다")
    void buildMarkdownEscapesNewlinesAndInjection() {
        // given
        User user = User.builder().userId("tester").build();
        Post post = Post.builder()
            .user(user)
            .title("첫 줄 제목\n---\n주입 시도")
            .description("설명 1줄\r\n설명 2줄\t\"따옴표\"")
            .content("정상 본문")
            .isPublic(true)
            .build();

        // when
        String markdown = FrontmatterUtils.buildMarkdown(post, List.of("태그\n1"));

        // then
        assertThat(markdown).contains("title: \"첫 줄 제목\\n---\\n주입 시도\"");
        assertThat(markdown).contains("description: \"설명 1줄\\r\\n설명 2줄\\t\\\"따옴표\\\"\"");
        assertThat(markdown).contains("  - \"태그\\n1\"");
        // Frontmatter 영역(처음 두 '---') 사이에 원시 개행에 의한 별도 --- 경계선 라인이 생성되지 않아야 함
        String frontmatterPart = markdown.substring(0, markdown.indexOf("---\n\n") + 3);
        long boundaryCount = frontmatterPart.lines()
            .filter(line -> line.trim().equals("---"))
            .count();
        assertThat(boundaryCount).isEqualTo(2);
    }
}
