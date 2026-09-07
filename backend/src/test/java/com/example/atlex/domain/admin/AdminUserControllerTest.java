package com.example.atlex.domain.admin;

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

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.MOCK,
    properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.jpa.hibernate.ddl-auto=create-drop"
    }
)
@Transactional
class AdminUserControllerTest {

    @Autowired WebApplicationContext context;
    @Autowired JwtProvider jwtProvider;
    @Autowired UserRepository userRepository;

    private MockMvc mockMvc;
    private String userToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        User regularUser = userRepository.save(User.builder()
                .userId("regular")
                .email("regular@test.com")
                .password("pw")
                .name("일반")
                .active(true)
                .role(UserRole.USER)
                .build());
        userToken = "Bearer " + jwtProvider.createAccessToken(regularUser.getId());

        User adminUser = userRepository.save(User.builder()
                .userId("admin")
                .email("admin@test.com")
                .password("pw")
                .name("관리자")
                .active(true)
                .role(UserRole.ADMIN)
                .build());
        adminToken = "Bearer " + jwtProvider.createAccessToken(adminUser.getId());
    }

    @Test
    @DisplayName("비로그인 사용자는 401")
    void 비로그인_401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("일반 사용자는 403")
    void 일반사용자_403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("deprecated 전체 사용자 조회도 일반 사용자는 403")
    void deprecated_전체사용자조회_일반사용자_403() throws Exception {
        mockMvc.perform(get("/api/v1/users/all")
                        .header("Authorization", userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("관리자는 200")
    void 관리자_200() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("deprecated 전체 사용자 조회는 관리자 200")
    void deprecated_전체사용자조회_관리자_200() throws Exception {
        mockMvc.perform(get("/api/v1/users/all")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("비활성 관리자 토큰으로 접근 시 401")
    void 비활성_관리자_401() throws Exception {
        User inactiveAdmin = userRepository.save(User.builder()
                .userId("inactive_admin")
                .email("inactive@test.com")
                .password("pw")
                .name("비활성관리자")
                .active(false)
                .role(com.example.atlex.domain.user.entity.UserRole.ADMIN)
                .build());
        String inactiveToken = "Bearer " + jwtProvider.createAccessToken(inactiveAdmin.getId());

        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", inactiveToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("잠긴 관리자 토큰으로 접근 시 401")
    void 잠긴_관리자_401() throws Exception {
        User lockedAdmin = userRepository.save(User.builder()
                .userId("locked_admin")
                .email("locked@test.com")
                .password("pw")
                .name("잠긴관리자")
                .active(true)
                .lockedUntil(LocalDateTime.now().plusMinutes(30))
                .role(com.example.atlex.domain.user.entity.UserRole.ADMIN)
                .build());
        String lockedToken = "Bearer " + jwtProvider.createAccessToken(lockedAdmin.getId());

        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", lockedToken))
                .andExpect(status().isUnauthorized());
    }
}
