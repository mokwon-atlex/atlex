package com.example.atlex.domain.tag;

import com.example.atlex.global.security.jwt.JwtProvider;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.tag.entity.PostTag;
import com.example.atlex.domain.tag.entity.Tag;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.tag.repository.PostTagRepository;
import com.example.atlex.domain.tag.repository.TagRepository;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
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

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb_tag;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Transactional
class TagControllerTest {

    @Autowired
    WebApplicationContext context;
    @Autowired
    JwtProvider jwtProvider;
    @Autowired
    UserRepository userRepository;
    @Autowired
    TagRepository tagRepository;
    @Autowired
    PostTagRepository postTagRepository;
    @Autowired
    PostRepository postRepository;
    @Autowired
    EntityManager entityManager;

    private MockMvc mockMvc;
    private User owner;
    private User other;
    private Tag tag1;
    private Tag tag2;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
            .apply(SecurityMockMvcConfigurers.springSecurity())
            .build();

        owner = saveUser("owner", "owner@test.com");
        other = saveUser("other", "other@test.com");

        tag1 = saveTag("Java");
        tag2 = saveTag("Spring");

        // Post 1 with tag1, tag2
        Post p1 = savePost(owner, "p1-thumb.png");
        savePostTag(owner, p1, tag1);
        savePostTag(owner, p1, tag2);

        // Post 2 with tag1
        Post p2 = savePost(owner, "p2-thumb.png");
        savePostTag(owner, p2, tag1);

        // Other's Post with tag1
        Post p3 = savePost(other, "other-thumb.png");
        savePostTag(other, p3, tag1);
    }

    @Test
    @DisplayName("사용자가 사용한 태그 목록을 조회한다")
    void getTags_success() throws Exception {
        // DESC order: Spring(tag2, higher id) → Java(tag1, lower id)
        mockMvc.perform(get("/api/v1/tags").param("userId", owner.getUserId()))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content", hasSize(2)))
            .andExpect(jsonPath("$.data.content[0].name").value("Spring"))
            .andExpect(jsonPath("$.data.content[0].postCount").value(1))
            .andExpect(jsonPath("$.data.content[0].thumbnailUrl").value("p1-thumb.png"))
            .andExpect(jsonPath("$.data.content[1].name").value("Java"))
            .andExpect(jsonPath("$.data.content[1].postCount").value(2))
            .andExpect(jsonPath("$.data.content[1].thumbnailUrl").value("p2-thumb.png"));
    }

    @Test
    @DisplayName("cursor pagination이 동작한다")
    void getTags_pagination() throws Exception {
        // First page (DESC): returns Spring(tag2), nextCursor = tag2.getId()
        mockMvc.perform(get("/api/v1/tags")
            .param("userId", owner.getUserId())
            .param("limit", "1"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content", hasSize(1)))
            .andExpect(jsonPath("$.data.hasNext").value(true))
            .andExpect(jsonPath("$.data.hasLast").value(false))
            .andExpect(jsonPath("$.data.nextCursor").value(tag2.getId()));

        // Second page (id < tag2.getId(), DESC): returns Java(tag1)
        mockMvc.perform(get("/api/v1/tags")
            .param("userId", owner.getUserId())
            .param("limit", "1")
            .param("cursor", tag2.getId().toString()))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content", hasSize(1)))
            .andExpect(jsonPath("$.data.content[0].name").value("Java"))
            .andExpect(jsonPath("$.data.hasNext").value(false))
            .andExpect(jsonPath("$.data.hasLast").value(true))
            .andExpect(jsonPath("$.data.nextCursor").value(nullValue()));
    }

    @Test
    @DisplayName("존재하지 않는 사용자 조회 시 USER_NOT_FOUND")
    void getTags_userNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/tags").param("userId", "nonexistent"))
            .andDo(print())
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("USER_NOT_FOUND"));
    }

    private User saveUser(String userId, String email) {
        return userRepository.saveAndFlush(User.builder()
            .userId(userId)
            .email(email)
            .password("pw")
            .name(userId)
            .active(true)
            .build());
    }

    private Tag saveTag(String name) {
        return tagRepository.saveAndFlush(Tag.of(name));
    }

    private Post savePost(User user, String thumbnailUrl) {
        return postRepository.saveAndFlush(Post.builder()
            .user(user)
            .title("title")
            .content("content")
            .thumbnailUrl(thumbnailUrl)
            .isPublic(true)
            .isDeleted(false)
            .build());
    }

    private void savePostTag(User user, Post post, Tag tag) {
        postTagRepository.saveAndFlush(PostTag.of(user, post, tag));
    }
}
