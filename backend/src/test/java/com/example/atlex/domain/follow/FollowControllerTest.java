package com.example.atlex.domain.follow;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.atlex.domain.user.entity.User;
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

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.jpa.hibernate.ddl-auto=create-drop",
})
@Transactional
class FollowControllerTest {

    @Autowired
    WebApplicationContext context;

    @Autowired
    JwtProvider jwtProvider;

    @Autowired
    UserRepository userRepository;

    private MockMvc mockMvc;
    private String followerToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
            .apply(SecurityMockMvcConfigurers.springSecurity())
            .build();

        User follower = userRepository.saveAndFlush(
            User.builder()
                .userId("follower1")
                .email("follower1@test.com")
                .password("pw")
                .name("팔로워유저")
                .active(true)
                .build());
        userRepository.saveAndFlush(
            User.builder()
                .userId("target1")
                .email("target1@test.com")
                .password("pw")
                .name("대상유저")
                .active(true)
                .build());
        followerToken = jwtProvider.createAccessToken(follower.getId());
    }

    @Test
    @DisplayName("팔로우 등록·조회·언팔로우 흐름 검증")
    void followAndUnfollow_success() throws Exception {
        mockMvc
            .perform(
                post("/api/v1/profiles/{userId}/follow", "target1").header("Authorization", "Bearer " + followerToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"))
            .andExpect(jsonPath("$.data.userId").value("target1"))
            .andExpect(jsonPath("$.data.following").value(true))
            .andExpect(jsonPath("$.data.followerCount").value(1))
            .andExpect(jsonPath("$.data.followingCount").value(0));

        // 프로필 응답에도 followerCount / following 반영 확인
        mockMvc
            .perform(get("/api/v1/profiles/{userId}", "target1").header("Authorization", "Bearer " + followerToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.followerCount").value(1))
            .andExpect(jsonPath("$.data.followingCount").value(0))
            .andExpect(jsonPath("$.data.following").value(true));

        // 팔로워 목록 조회
        mockMvc
            .perform(get("/api/v1/profiles/{userId}/followers", "target1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.length()").value(1))
            .andExpect(jsonPath("$.data[0].userId").value("follower1"));

        // 팔로잉 목록 조회
        mockMvc
            .perform(get("/api/v1/profiles/{userId}/following", "follower1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.length()").value(1))
            .andExpect(jsonPath("$.data[0].userId").value("target1"));

        // 언팔로우
        mockMvc
            .perform(delete("/api/v1/profiles/{userId}/follow", "target1").header("Authorization",
                "Bearer " + followerToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.following").value(false))
            .andExpect(jsonPath("$.data.followerCount").value(0));
    }

    @Test
    @DisplayName("자기 자신 팔로우 시 400 반환")
    void follow_self_badRequest() throws Exception {
        mockMvc
            .perform(
                post("/api/v1/profiles/{userId}/follow", "follower1").header("Authorization",
                    "Bearer " + followerToken))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("SELF_FOLLOW_NOT_ALLOWED"));
    }

    @Test
    @DisplayName("비인증 팔로우 요청 시 401 반환")
    void follow_unauthenticated_unauthorized() throws Exception {
        mockMvc.perform(post("/api/v1/profiles/{userId}/follow", "target1")).andExpect(status().isUnauthorized());
    }
}
