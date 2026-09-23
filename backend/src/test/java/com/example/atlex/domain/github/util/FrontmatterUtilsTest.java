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
}
