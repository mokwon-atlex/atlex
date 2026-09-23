package com.example.atlex.domain.github;

import com.example.atlex.domain.category.entity.Category;
import com.example.atlex.domain.category.repository.CategoryRepository;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.tag.entity.PostTag;
import com.example.atlex.domain.tag.entity.Tag;
import com.example.atlex.domain.tag.repository.PostTagRepository;
import com.example.atlex.domain.tag.repository.TagRepository;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import com.example.atlex.global.security.jwt.JwtProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb_export;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Transactional
class PostMarkdownExportControllerTest {

    @Autowired
    WebApplicationContext context;
    @Autowired
    JwtProvider jwtProvider;
    @Autowired
    UserRepository userRepository;
    @Autowired
    CategoryRepository categoryRepository;
    @Autowired
    PostRepository postRepository;
    @Autowired
    TagRepository tagRepository;
    @Autowired
    PostTagRepository postTagRepository;

    private MockMvc mockMvc;
    private User author;
    private User otherUser;
    private Post publicPost;
    private Post privatePost;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
            .apply(SecurityMockMvcConfigurers.springSecurity())
            .build();

        author = userRepository.save(User.builder()
            .userId("author")
            .email("author@example.com")
            .password("password")
            .name("작성자")
            .termsAgreed(true)
            .privacyAgreed(true)
            .build());

        otherUser = userRepository.save(User.builder()
            .userId("other")
            .email("other@example.com")
            .password("password")
            .name("타인")
            .termsAgreed(true)
            .privacyAgreed(true)
            .build());

        Category category = categoryRepository.save(Category.builder()
            .name("개발")
            .user(author)
            .build());

        publicPost = postRepository.save(Post.builder()
            .user(author)
            .category(category)
            .title("공개 게시글 제목")
            .description("공개글 설명")
            .content("## 공개글 내용입니다.")
            .isPublic(true)
            .build());

        Tag tag = tagRepository.save(Tag.builder().name("Java").build());
        postTagRepository.save(PostTag.of(author, publicPost, tag));

        privatePost = postRepository.save(Post.builder()
            .user(author)
            .category(category)
            .title("비공개 게시글 제목")
            .description("비공개글 설명")
            .content("비공개 본문")
            .isPublic(false)
            .build());
    }

    @Test
    @DisplayName("공개 글의 마크다운 내보내기 데이터를 JSON으로 조회할 수 있다")
    void getPostMarkdownPublicSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/posts/" + publicPost.getId() + "/export/markdown"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"))
            .andExpect(jsonPath("$.data.filename").value(org.hamcrest.Matchers.containsString("공개-게시글-제목.md")))
            .andExpect(jsonPath("$.data.content").value(org.hamcrest.Matchers.containsString("title: \"공개 게시글 제목\"")))
            .andExpect(jsonPath("$.data.content").value(org.hamcrest.Matchers.containsString("## 공개글 내용입니다.")));
    }

    @Test
    @DisplayName("공개 글의 마크다운 파일을 .md 첨부 파일로 다운로드할 수 있다")
    void downloadPostMarkdownPublicSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/posts/" + publicPost.getId() + "/download/markdown"))
            .andExpect(status().isOk())
            .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, org.hamcrest.Matchers.containsString(".md")))
            .andExpect(content().contentType("text/markdown;charset=UTF-8"))
            .andExpect(content().string(org.hamcrest.Matchers.containsString("title: \"공개 게시글 제목\"")));
    }

    @Test
    @DisplayName("비공개 글은 작성자가 아닌 타인이 다운로드 시도 시 404를 반환한다")
    void downloadPostMarkdownPrivateForbidden() throws Exception {
        String otherToken = "Bearer " + jwtProvider.createAccessToken(otherUser.getId());

        mockMvc.perform(get("/api/v1/posts/" + privatePost.getId() + "/download/markdown")
            .header("Authorization", otherToken))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("비공개 글이라도 작성자 본인은 다운로드할 수 있다")
    void downloadPostMarkdownPrivateAuthorSuccess() throws Exception {
        String authorToken = "Bearer " + jwtProvider.createAccessToken(author.getId());

        mockMvc.perform(get("/api/v1/posts/" + privatePost.getId() + "/download/markdown")
            .header("Authorization", authorToken))
            .andExpect(status().isOk())
            .andExpect(content().string(org.hamcrest.Matchers.containsString("title: \"비공개 게시글 제목\"")));
    }
}
