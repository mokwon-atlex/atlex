package com.example.atlex.domain.auth.oauth2;

import com.example.atlex.domain.auth.entity.SocialProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class OAuth2UserInfoTest {

    @Test
    @DisplayName("GitHub 속성 파싱 - name 없으면 login으로 대체")
    void github_속성_파싱() {
        OAuth2UserInfo info = OAuth2UserInfo.of("github", Map.of(
            "id", 123456,
            "login", "octocat",
            "email", "octo@github.com"));

        assertEquals(SocialProvider.GITHUB, info.getProvider());
        assertEquals("123456", info.getProviderId());
        assertEquals("octo@github.com", info.getEmail());
        assertEquals("octocat", info.getName());
    }

    @Test
    @DisplayName("Google 속성 파싱")
    void google_속성_파싱() {
        OAuth2UserInfo info = OAuth2UserInfo.of("google", Map.of(
            "sub", "google-sub-1",
            "email", "user@gmail.com",
            "name", "홍길동"));

        assertEquals(SocialProvider.GOOGLE, info.getProvider());
        assertEquals("google-sub-1", info.getProviderId());
        assertEquals("user@gmail.com", info.getEmail());
        assertEquals("홍길동", info.getName());
    }

    @Test
    @DisplayName("Kakao 중첩 속성 파싱")
    void kakao_속성_파싱() {
        OAuth2UserInfo info = OAuth2UserInfo.of("kakao", Map.of(
            "id", 987654321L,
            "kakao_account", Map.of(
                "email", "user@kakao.com",
                "profile", Map.of("nickname", "카카오유저"))));

        assertEquals(SocialProvider.KAKAO, info.getProvider());
        assertEquals("987654321", info.getProviderId());
        assertEquals("user@kakao.com", info.getEmail());
        assertEquals("카카오유저", info.getName());
    }

    @Test
    @DisplayName("지원하지 않는 OAuth2 제공자는 IllegalArgumentException")
    void 미지원_제공자_예외() {
        assertThrows(IllegalArgumentException.class,
            () -> OAuth2UserInfo.of("naver", Map.of("id", "1")));
    }
}
