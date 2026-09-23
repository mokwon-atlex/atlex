package com.example.atlex.domain.github;

import com.example.atlex.domain.github.dto.request.GitHubConfigUpdateRequest;
import com.example.atlex.domain.github.entity.DeleteOption;
import com.example.atlex.domain.github.entity.GitHubSyncConfig;
import com.example.atlex.domain.github.entity.SyncStatus;
import com.example.atlex.domain.github.repository.GitHubSyncConfigRepository;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import com.example.atlex.global.security.jwt.JwtProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb_github;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "github.client-id=test-client-id",
    "github.client-secret=test-client-secret"
})
@Transactional
class GitHubSyncControllerTest {

    @Autowired
    WebApplicationContext context;
    @Autowired
    JwtProvider jwtProvider;
    @Autowired
    UserRepository userRepository;
    @Autowired
    GitHubSyncConfigRepository gitHubSyncConfigRepository;
    @Autowired
    ObjectMapper objectMapper;

    private MockMvc mockMvc;
    private String token;
    private User testUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
            .apply(SecurityMockMvcConfigurers.springSecurity())
            .build();

        testUser = userRepository.save(User.builder()
            .userId("githubtester")
            .email("tester@example.com")
            .password("encodedPassword")
            .name("깃허브테스터")
            .termsAgreed(true)
            .privacyAgreed(true)
            .build());

        token = "Bearer " + jwtProvider.createAccessToken(testUser.getId());
    }

    @Test
    @DisplayName("인증된 사용자는 GitHub OAuth 인가 URL을 조회할 수 있다")
    void getOAuthUrlSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/github/oauth/url")
            .header("Authorization", token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"))
            .andExpect(jsonPath("$.data.url").exists())
            .andExpect(
                jsonPath("$.data.url").value(org.hamcrest.Matchers.containsString("github.com/login/oauth/authorize")));
    }

    @Test
    @DisplayName("연동 설정이 없는 상태에서 설정을 조회하면 isConnected가 false로 반환된다")
    void getConfigDisconnected() throws Exception {
        mockMvc.perform(get("/api/v1/github/config")
            .header("Authorization", token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"))
            .andExpect(jsonPath("$.data.isConnected").value(false));
    }

    @Test
    @DisplayName("연동 설정이 존재하는 경우 설정 정보를 정상 조회할 수 있다")
    void getConfigConnected() throws Exception {
        gitHubSyncConfigRepository.save(GitHubSyncConfig.builder()
            .user(testUser)
            .encryptedAccessToken("encrypted-dummy-token")
            .githubUsername("octocat")
            .githubEmail("octocat@github.com")
            .repositoryName("octocat/blog-posts")
            .branchName("main")
            .directoryPath("posts/")
            .deleteOption(DeleteOption.DELETE_FILE)
            .isEnabled(true)
            .syncStatus(SyncStatus.SUCCESS)
            .build());

        mockMvc.perform(get("/api/v1/github/config")
            .header("Authorization", token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"))
            .andExpect(jsonPath("$.data.isConnected").value(true))
            .andExpect(jsonPath("$.data.githubUsername").value("octocat"))
            .andExpect(jsonPath("$.data.repositoryName").value("octocat/blog-posts"));
    }

    @Test
    @DisplayName("동기화 대상 저장소 및 옵션 설정을 수정할 수 있다")
    void updateConfigSuccess() throws Exception {
        gitHubSyncConfigRepository.save(GitHubSyncConfig.builder()
            .user(testUser)
            .encryptedAccessToken("encrypted-dummy-token")
            .githubUsername("octocat")
            .githubEmail("octocat@github.com")
            .build());

        GitHubConfigUpdateRequest request = GitHubConfigUpdateRequest.builder()
            .repositoryName("octocat/tech-notes")
            .branchName("master")
            .directoryPath("articles/")
            .deleteOption(DeleteOption.KEEP_FILE)
            .isEnabled(true)
            .build();

        mockMvc.perform(patch("/api/v1/github/config")
            .header("Authorization", token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"))
            .andExpect(jsonPath("$.data.repositoryName").value("octocat/tech-notes"))
            .andExpect(jsonPath("$.data.branchName").value("master"))
            .andExpect(jsonPath("$.data.directoryPath").value("articles/"))
            .andExpect(jsonPath("$.data.deleteOption").value("KEEP_FILE"));
    }

    @Test
    @DisplayName("연동 해제 요청 시 연동 데이터가 정상 삭제된다")
    void disconnectSuccess() throws Exception {
        gitHubSyncConfigRepository.save(GitHubSyncConfig.builder()
            .user(testUser)
            .encryptedAccessToken("encrypted-dummy-token")
            .githubUsername("octocat")
            .build());

        mockMvc.perform(delete("/api/v1/github/config")
            .header("Authorization", token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"));

        mockMvc.perform(get("/api/v1/github/config")
            .header("Authorization", token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.isConnected").value(false));
    }
}
