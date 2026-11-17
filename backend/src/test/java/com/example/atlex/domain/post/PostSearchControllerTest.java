package com.example.atlex.domain.post;

import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.tag.entity.PostTag;
import com.example.atlex.domain.tag.entity.Tag;
import com.example.atlex.domain.tag.repository.PostTagRepository;
import com.example.atlex.domain.tag.repository.TagRepository;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.entity.UserRole;
import com.example.atlex.domain.user.repository.UserRepository;
import com.example.atlex.global.security.jwt.JwtProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, properties = {
    "spring.datasource.url=jdbc:h2:mem:postsearchtestdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Transactional
class PostSearchControllerTest {

    @Autowired
    WebApplicationContext context;
    @Autowired
    JwtProvider jwtProvider;
    @Autowired
    UserRepository userRepository;
    @Autowired
    PostRepository postRepository;
    @Autowired
    TagRepository tagRepository;
    @Autowired
    PostTagRepository postTagRepository;

    private MockMvc mockMvc;
    private String authorToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
            .apply(SecurityMockMvcConfigurers.springSecurity())
            .build();

        User author = userRepository.saveAndFlush(User.builder()
            .userId("alice")
            .email("alice@test.com")
            .password("pw")
            .name("앨리스")
            .active(true)
            .role(UserRole.USER)
            .build());
        authorToken = jwtProvider.createAccessToken(author.getId());

        Post publicPost = postRepository.saveAndFlush(Post.builder()
            .user(author)
            .title("Spring Security 가이드")
            .description("JWT 인증 흐름 정리")
            .content("필터 체인과 토큰 검증을 설명합니다.")
            .isPublic(true)
            .build());
        postRepository.saveAndFlush(Post.builder()
            .user(author)
            .title("비공개 Spring 메모")
            .content("비밀 메모")
            .isPublic(false)
            .build());

        Tag tag = tagRepository.saveAndFlush(Tag.builder().name("Backend").build());
        postTagRepository.saveAndFlush(PostTag.of(author, publicPost, tag));
    }

    @Test
    @DisplayName("비로그인 상태에서 키워드로 공개 게시글의 제목, 본문, 태그를 검색한다")
    void searchPublicPosts() throws Exception {
        mockMvc.perform(get("/api/v1/posts").param("keyword", "spring"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalElements").value(1))
            .andExpect(jsonPath("$.data.content[0].title").value("Spring Security 가이드"));

        mockMvc.perform(get("/api/v1/posts").param("keyword", "토큰 검증"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalElements").value(1));

        mockMvc.perform(get("/api/v1/posts").param("keyword", "backend"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    @DisplayName("작성자 본인은 키워드 검색 시 본인 비공개 게시글도 함께 조회한다")
    void searchIncludesOwnPrivatePosts() throws Exception {
        mockMvc.perform(get("/api/v1/posts")
            .param("keyword", "spring")
            .header("Authorization", "Bearer " + authorToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalElements").value(2));
    }
}
