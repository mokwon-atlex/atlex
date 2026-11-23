package com.example.atlex.domain.auth;

import com.example.atlex.domain.auth.dto.request.OAuth2ExchangeRequest;
import com.example.atlex.domain.auth.dto.request.OAuth2OnboardingRequest;
import com.example.atlex.domain.auth.entity.SocialProvider;
import com.example.atlex.domain.auth.exception.InvalidTokenException;
import com.example.atlex.domain.auth.oauth2.OAuth2CodeStore;
import com.example.atlex.domain.auth.oauth2.OAuth2OnboardingPayload;
import com.example.atlex.domain.auth.repository.SocialAccountRepository;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb_oauth2;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Transactional
class OAuth2AuthControllerTest {

    @Autowired
    private WebApplicationContext context;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SocialAccountRepository socialAccountRepository;

    @MockitoBean
    private OAuth2CodeStore oAuth2CodeStore;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
            .apply(SecurityMockMvcConfigurers.springSecurity())
            .build();
    }

    @Test
    @DisplayName("POST /api/v1/auth/oauth2/exchange - 유효한 일회용 코드로 JWT 토큰 발급")
    void oauth2_exchange_success() throws Exception {
        User user = userRepository.save(User.builder()
            .userId("socialuser1")
            .email("social1@example.com")
            .name("소셜유저")
            .termsAgreed(true)
            .privacyAgreed(true)
            .agreedAt(LocalDateTime.now())
            .build());

        when(oAuth2CodeStore.consumeLoginCode("valid-code")).thenReturn(user.getId());

        mockMvc.perform(post("/api/v1/auth/oauth2/exchange")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new OAuth2ExchangeRequest("valid-code"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"))
            .andExpect(jsonPath("$.data.userId").value("socialuser1"))
            .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.data.refreshToken").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/v1/auth/oauth2/exchange - 만료된 코드는 401 반환")
    void oauth2_exchange_invalid_code() throws Exception {
        when(oAuth2CodeStore.consumeLoginCode("expired"))
            .thenThrow(new InvalidTokenException("유효하지 않거나 만료된 OAuth2 인증 코드입니다."));

        mockMvc.perform(post("/api/v1/auth/oauth2/exchange")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new OAuth2ExchangeRequest("expired"))))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("INVALID_TOKEN"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/oauth2/onboarding - 신규 소셜 사용자 온보딩 및 계정 연동 성공")
    void oauth2_onboarding_success() throws Exception {
        when(oAuth2CodeStore.getOnboardingPayload("onboard-1")).thenReturn(
            new OAuth2OnboardingPayload(SocialProvider.KAKAO, "kakao-999", "kakao999@example.com", "카카오"));

        OAuth2OnboardingRequest request = new OAuth2OnboardingRequest(
            "onboard-1", "kakaodev", "홍길동", null, true, true, false);

        mockMvc.perform(post("/api/v1/auth/oauth2/onboarding")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.code").value("SUCCESS"))
            .andExpect(jsonPath("$.data.userId").value("kakaodev"))
            .andExpect(jsonPath("$.data.accessToken").isNotEmpty());

        assertTrue(socialAccountRepository.existsByProviderAndProviderId(SocialProvider.KAKAO, "kakao-999"));
        verify(oAuth2CodeStore).deleteOnboardingToken("onboard-1");
    }
}
