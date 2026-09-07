package com.example.atlex.domain.profile;

import com.example.atlex.global.security.jwt.JwtProvider;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.nullValue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Transactional
class ProfileControllerTest {

    @Autowired
    WebApplicationContext context;
    @Autowired
    JwtProvider jwtProvider;
    @Autowired
    UserRepository userRepository;

    private MockMvc mockMvc;
    private Long activeUserId;
    private String token;
    private String otherToken;
    private String profileToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
            .apply(SecurityMockMvcConfigurers.springSecurity())
            .build();

        User activeUser = userRepository.saveAndFlush(User.builder()
            .userId("testuser")
            .email("test@test.com")
            .password("pw")
            .name("테스터")
            .profileImage("https://example.com/profile.png")
            .info("안녕하세요.")
            .active(true)
            .build());
        activeUserId = activeUser.getId();
        token = jwtProvider.createAccessToken(activeUserId);

        User otherUser = userRepository.saveAndFlush(User.builder()
            .userId("otheruser")
            .email("other@test.com")
            .password("pw")
            .name("other")
            .active(true)
            .build());
        otherToken = jwtProvider.createAccessToken(otherUser.getId());

        User profileUser = userRepository.saveAndFlush(User.builder()
            .userId("profileuser")
            .email("profile@test.com")
            .password("pw")
            .name("profile")
            .profileImage("https://example.com/original.png")
            .info("original info")
            .active(true)
            .build());
        profileToken = jwtProvider.createAccessToken(profileUser.getId());

        userRepository.saveAndFlush(User.builder()
            .userId("inactive")
            .email("inactive@test.com")
            .password("pw")
            .name("비활성")
            .active(false)
            .build());

        userRepository.saveAndFlush(User.builder()
            .userId("emptyprofile")
            .email("emptyprofile@test.com")
            .password("pw")
            .name("빈프로필")
            .active(true)
            .build());
    }

    @Test
    @DisplayName("비로그인 + 활성 회원 공개 프로필 조회 → 200")
    void getProfile_anonymous_active() throws Exception {
        mockMvc.perform(get("/api/v1/profiles/{userId}", "testuser"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("로그인 + 활성 회원 공개 프로필 조회 → 200")
    void getProfile_loggedIn_active() throws Exception {
        mockMvc.perform(get("/api/v1/profiles/{userId}", "testuser")
            .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("존재하지 않는 userId 조회 → 404")
    void getProfile_notFound() throws Exception {
        mockMvc.perform(get("/api/v1/profiles/{userId}", "nonexistent"))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("active=false 회원 조회 → 404")
    void getProfile_inactive() throws Exception {
        mockMvc.perform(get("/api/v1/profiles/{userId}", "inactive"))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/v1/users/{userId} 비로그인 → 401")
    void getUser_anonymous_unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/users/{userId}", "testuser"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/users/{userId} 본인 조회 → 200")
    void getUser_owner_success() throws Exception {
        mockMvc.perform(get("/api/v1/users/{userId}", "testuser")
            .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(activeUserId))
            .andExpect(jsonPath("$.data.userId").value("testuser"));
    }

    @Test
    @DisplayName("GET /api/v1/users/{userId} 타인 조회 → 403")
    void getUser_otherUser_forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/users/{userId}", "testuser")
            .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }

    @Test
    @DisplayName("기존 GET /api/v1/users/all 비로그인 → 401")
    void getAllUsers_anonymous_unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/users/all"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/users/all 일반 사용자 → 403")
    void getAllUsers_regularUser_forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/users/all")
            .header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("공개 프로필 응답에 id, userId, name, profileImage, info 포함 및 민감 필드 없음")
    void getProfile_responseFields() throws Exception {
        mockMvc.perform(get("/api/v1/profiles/{userId}", "testuser"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").exists())
            .andExpect(jsonPath("$.data.userId").value("testuser"))
            .andExpect(jsonPath("$.data.name").value("테스터"))
            .andExpect(jsonPath("$.data.profileImage").value("https://example.com/profile.png"))
            .andExpect(jsonPath("$.data.info").value("안녕하세요."))
            .andExpect(jsonPath("$.data.email").doesNotExist())
            .andExpect(jsonPath("$.data.active").doesNotExist())
            .andExpect(jsonPath("$.data.marketingAgreed").doesNotExist())
            .andExpect(jsonPath("$.data.createdAt").doesNotExist())
            .andExpect(jsonPath("$.data.updatedAt").doesNotExist());
    }

    @Test
    @DisplayName("profileImage와 info가 null이어도 공개 프로필 응답")
    void getProfile_nullProfileFields() throws Exception {
        mockMvc.perform(get("/api/v1/profiles/{userId}", "emptyprofile"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").exists())
            .andExpect(jsonPath("$.data.userId").value("emptyprofile"))
            .andExpect(jsonPath("$.data.name").value("빈프로필"))
            .andExpect(jsonPath("$.data.profileImage").value(nullValue()))
            .andExpect(jsonPath("$.data.info").value(nullValue()));
    }

    @Test
    @DisplayName("로그인 본인 프로필 PATCH -> 200 및 응답 반영")
    void updateProfile_owner_success() throws Exception {
        mockMvc.perform(patch("/api/v1/profiles/{userId}", "testuser")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "name": "updated",
                  "profileImage": "https://example.com/updated.png",
                  "info": "updated info"
                }
                """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"))
            .andExpect(jsonPath("$.message").value("프로필 수정 성공"))
            .andExpect(jsonPath("$.data.id").value(activeUserId))
            .andExpect(jsonPath("$.data.userId").value("testuser"))
            .andExpect(jsonPath("$.data.name").value("updated"))
            .andExpect(jsonPath("$.data.profileImage").value("https://example.com/updated.png"))
            .andExpect(jsonPath("$.data.info").value("updated info"))
            .andExpect(jsonPath("$.data.follow").doesNotExist())
            .andExpect(jsonPath("$.data.follower").doesNotExist());
    }

    @Test
    @DisplayName("프로필 PATCH null 필드는 기존 값 유지")
    void updateProfile_nullFields_keepExistingValues() throws Exception {
        mockMvc.perform(patch("/api/v1/profiles/{userId}", "profileuser")
            .header("Authorization", "Bearer " + profileToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "name": "onlyname",
                  "profileImage": null,
                  "info": null
                }
                """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.userId").value("profileuser"))
            .andExpect(jsonPath("$.data.name").value("onlyname"))
            .andExpect(jsonPath("$.data.profileImage").value("https://example.com/original.png"))
            .andExpect(jsonPath("$.data.info").value("original info"));
    }

    @Test
    @DisplayName("존재하지 않는 userId 프로필 PATCH -> 403 (컨트롤러 userId 불일치 우선 거부)")
    void updateProfile_notFound() throws Exception {
        mockMvc.perform(patch("/api/v1/profiles/{userId}", "nonexistent")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"updated\"}"))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }

    @Test
    @DisplayName("비활성 회원 프로필 PATCH -> 403 (컨트롤러 userId 불일치 우선 거부)")
    void updateProfile_inactive() throws Exception {
        mockMvc.perform(patch("/api/v1/profiles/{userId}", "inactive")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"updated\"}"))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }

    @Test
    @DisplayName("다른 사용자 프로필 PATCH -> 403")
    void updateProfile_otherUser_forbidden() throws Exception {
        mockMvc.perform(patch("/api/v1/profiles/{userId}", "testuser")
            .header("Authorization", "Bearer " + otherToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"updated\"}"))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }

    @Test
    @DisplayName("비로그인 프로필 PATCH -> 401")
    void updateProfile_anonymous_unauthorized() throws Exception {
        mockMvc.perform(patch("/api/v1/profiles/{userId}", "testuser")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"updated\"}"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("프로필 PATCH validation 실패 -> 400")
    void updateProfile_validationError() throws Exception {
        mockMvc.perform(patch("/api/v1/profiles/{userId}", "testuser")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"   \"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errors[0].data.key").value("name"));
    }

    @Test
    @DisplayName("프로필 PATCH profileImage 255자 초과 -> 400")
    void updateProfile_profileImageTooLong() throws Exception {
        String longProfileImage = "a".repeat(256);

        mockMvc.perform(patch("/api/v1/profiles/{userId}", "testuser")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"profileImage\":\"" + longProfileImage + "\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errors[0].data.key").value("profileImage"));
    }

    @Test
    @DisplayName("프로필 PATCH info 255자 초과 -> 400")
    void updateProfile_infoTooLong() throws Exception {
        String longInfo = "a".repeat(256);

        mockMvc.perform(patch("/api/v1/profiles/{userId}", "testuser")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"info\":\"" + longInfo + "\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errors[0].data.key").value("info"));
    }
}
