package com.example.atlex.domain.ai;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.atlex.domain.ai.dto.request.DescriptionSuggestionRequest;
import com.example.atlex.domain.ai.dto.request.ParagraphSuggestionRequest;
import com.example.atlex.domain.ai.dto.request.TitleSuggestionRequest;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import com.example.atlex.global.security.jwt.JwtProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
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

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Transactional
class AiSuggestionControllerTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;
    private String userToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
            .apply(SecurityMockMvcConfigurers.springSecurity())
            .build();

        User user = userRepository.saveAndFlush(User.builder()
            .userId("aiTester")
            .email("aiTester@test.com")
            .password("pw")
            .name("AI 테스터")
            .active(true)
            .build());

        userToken = jwtProvider.createAccessToken(user.getId());
    }

    // ────────────────────────── 인증(Security) 테스트 ──────────────────────────

    @Test
    @DisplayName("인증되지 않은 요청으로 제목 추천 시 401 Unauthorized를 반환한다")
    void suggestTitle_unauthorized() throws Exception {
        TitleSuggestionRequest request = new TitleSuggestionRequest("스프링 부트로", "기술", List.of("AI"));

        mockMvc.perform(post("/api/v1/ai/suggest/title")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("인증되지 않은 요청으로 단락 추천 시 401 Unauthorized를 반환한다")
    void suggestParagraph_unauthorized() throws Exception {
        ParagraphSuggestionRequest request = new ParagraphSuggestionRequest("제목", "기술", List.of("AI"), "내용");

        mockMvc.perform(post("/api/v1/ai/suggest/paragraph")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("인증되지 않은 요청으로 요약 추천 시 401 Unauthorized를 반환한다")
    void suggestDescription_unauthorized() throws Exception {
        DescriptionSuggestionRequest request = new DescriptionSuggestionRequest("제목", "본문 요약 요청");

        mockMvc.perform(post("/api/v1/ai/suggest/description")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized());
    }

    // ────────────────────────── 정상 성공(200 OK) 테스트 ──────────────────────────

    @Test
    @DisplayName("인증된 사용자가 유효한 제목으로 요청 시 200 OK와 추천 텍스트를 반환한다")
    void suggestTitle_success() throws Exception {
        TitleSuggestionRequest request = new TitleSuggestionRequest("스프링 부트로", "기술", List.of("AI"));

        mockMvc.perform(post("/api/v1/ai/suggest/title")
            .header("Authorization", "Bearer " + userToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"))
            .andExpect(jsonPath("$.data.suggestion").isString());
    }

    @Test
    @DisplayName("인증된 사용자가 유효한 단락 요청 시 200 OK와 단락 제안을 반환한다")
    void suggestParagraph_success() throws Exception {
        ParagraphSuggestionRequest request = new ParagraphSuggestionRequest(
            "블로그 만들기", "기술", List.of("Spring"), "의존성 설정을 완료했습니다.");

        mockMvc.perform(post("/api/v1/ai/suggest/paragraph")
            .header("Authorization", "Bearer " + userToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"))
            .andExpect(jsonPath("$.data.suggestion").isString());
    }

    @Test
    @DisplayName("인증된 사용자가 유효한 요약 요청 시 200 OK와 요약 제안을 반환한다")
    void suggestDescription_success() throws Exception {
        DescriptionSuggestionRequest request = new DescriptionSuggestionRequest(
            "블로그 만들기", "스프링 부트 환경에서 블로그 AI 서비스를 구축하는 내용입니다.");

        mockMvc.perform(post("/api/v1/ai/suggest/description")
            .header("Authorization", "Bearer " + userToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"))
            .andExpect(jsonPath("$.data.suggestion").isString());
    }

    // ────────────────────────── 유효성 검증(Bean Validation 400) 테스트 ──────────────────────────

    @Test
    @DisplayName("TitleSuggestionRequest - 제목이 비어있으면 400 Bad Request를 반환한다")
    void suggestTitle_validationError_blankTitle() throws Exception {
        TitleSuggestionRequest request = new TitleSuggestionRequest("   ", "기술", List.of("AI"));

        mockMvc.perform(post("/api/v1/ai/suggest/title")
            .header("Authorization", "Bearer " + userToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TitleSuggestionRequest - 카테고리가 100자 초과이면 400 Bad Request를 반환한다")
    void suggestTitle_validationError_categoryTooLong() throws Exception {
        String longCategory = "a".repeat(101);
        TitleSuggestionRequest request = new TitleSuggestionRequest("유효한 제목", longCategory, List.of("AI"));

        mockMvc.perform(post("/api/v1/ai/suggest/title")
            .header("Authorization", "Bearer " + userToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TitleSuggestionRequest - 태그가 10개 초과이면 400 Bad Request를 반환한다")
    void suggestTitle_validationError_tooManyTags() throws Exception {
        List<String> tooManyTags = new ArrayList<>();
        for (int i = 0; i < 11; i++) {
            tooManyTags.add("tag" + i);
        }
        TitleSuggestionRequest request = new TitleSuggestionRequest("유효한 제목", "기술", tooManyTags);

        mockMvc.perform(post("/api/v1/ai/suggest/title")
            .header("Authorization", "Bearer " + userToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TitleSuggestionRequest - 개별 태그가 100자 초과이면 400 Bad Request를 반환한다")
    void suggestTitle_validationError_tagTooLong() throws Exception {
        String longTag = "t".repeat(101);
        TitleSuggestionRequest request = new TitleSuggestionRequest("유효한 제목", "기술", List.of(longTag));

        mockMvc.perform(post("/api/v1/ai/suggest/title")
            .header("Authorization", "Bearer " + userToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("ParagraphSuggestionRequest - 제목이 200자 초과이면 400 Bad Request를 반환한다")
    void suggestParagraph_validationError_titleTooLong() throws Exception {
        String longTitle = "t".repeat(201);
        ParagraphSuggestionRequest request = new ParagraphSuggestionRequest(longTitle, "기술", List.of("Spring"), "내용");

        mockMvc.perform(post("/api/v1/ai/suggest/paragraph")
            .header("Authorization", "Bearer " + userToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DescriptionSuggestionRequest - 제목이 200자 초과이면 400 Bad Request를 반환한다")
    void suggestDescription_validationError_titleTooLong() throws Exception {
        String longTitle = "t".repeat(201);
        DescriptionSuggestionRequest request = new DescriptionSuggestionRequest(longTitle, "요약할 본문 내용입니다.");

        mockMvc.perform(post("/api/v1/ai/suggest/description")
            .header("Authorization", "Bearer " + userToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DescriptionSuggestionRequest - 본문이 비어있으면 400 Bad Request를 반환한다")
    void suggestDescription_validationError_blankContent() throws Exception {
        DescriptionSuggestionRequest request = new DescriptionSuggestionRequest("유효한 제목", "   ");

        mockMvc.perform(post("/api/v1/ai/suggest/description")
            .header("Authorization", "Bearer " + userToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }
}
