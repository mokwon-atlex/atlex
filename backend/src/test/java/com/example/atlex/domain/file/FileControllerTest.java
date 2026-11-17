package com.example.atlex.domain.file;

import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.entity.UserRole;
import com.example.atlex.domain.user.repository.UserRepository;
import com.example.atlex.global.security.jwt.JwtProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, properties = {
    "spring.datasource.url=jdbc:h2:mem:filetestdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Transactional
class FileControllerTest {

    @TempDir
    static Path tempDir;

    @DynamicPropertySource
    static void overrideProperties(DynamicPropertyRegistry registry) {
        registry.add("file.upload-dir", () -> tempDir.toString());
    }

    @Autowired
    WebApplicationContext context;
    @Autowired
    JwtProvider jwtProvider;
    @Autowired
    UserRepository userRepository;

    private MockMvc mockMvc;
    private String token;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
            .apply(SecurityMockMvcConfigurers.springSecurity())
            .build();

        User user = userRepository.saveAndFlush(User.builder()
            .userId("uploader")
            .email("uploader@test.com")
            .password("pw")
            .name("업로더")
            .active(true)
            .role(UserRole.USER)
            .build());
        token = jwtProvider.createAccessToken(user.getId());
    }

    @Test
    @DisplayName("비인증 사용자는 파일을 업로드할 수 없다")
    void uploadRequiresAuth() throws Exception {
        MockMultipartFile image = new MockMultipartFile(
            "file", "photo.png", "image/png", "data".getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(multipart("/api/v1/files/images").file(image))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("인증된 사용자가 이미지를 업로드하면 URL을 반환하고 누구나 조회할 수 있다")
    void uploadAndServeImage() throws Exception {
        MockMultipartFile image = new MockMultipartFile(
            "file", "photo.png", "image/png", "png-bytes".getBytes(StandardCharsets.UTF_8));

        MvcResult result = mockMvc.perform(multipart("/api/v1/files/images")
            .file(image)
            .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"))
            .andExpect(jsonPath("$.data.originalName").value("photo.png"))
            .andExpect(jsonPath("$.data.image").value(true))
            .andReturn();

        String body = result.getResponse().getContentAsString();
        String url = com.jayway.jsonpath.JsonPath.read(body, "$.data.url");

        mockMvc.perform(get(url))
            .andExpect(status().isOk())
            .andExpect(header().string("X-Content-Type-Options", "nosniff"));
    }
}
