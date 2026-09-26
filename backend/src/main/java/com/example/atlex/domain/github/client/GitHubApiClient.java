package com.example.atlex.domain.github.client;

import com.example.atlex.domain.github.dto.response.GitHubRepoResponse;
import com.example.atlex.domain.github.exception.GitHubApiException;
import com.example.atlex.domain.github.exception.GitHubOAuthFailedException;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;

/**
 * GitHub REST API 및 OAuth 엔드포인트와의 HTTP 통신을 담당하는 클라이언트입니다.
 */
@Slf4j
@Component
public class GitHubApiClient {

    private static final String GITHUB_OAUTH_TOKEN_URL = "https://github.com/login/oauth/access_token";
    private static final String GITHUB_API_BASE_URL = "https://api.github.com";
    private static final String GITHUB_API_VERSION = "2022-11-28";
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(5);
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(15);

    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    /**
     * GitHubApiClient 생성자입니다. RestClient에 연결 및 읽기 타임아웃을 설정합니다.
     *
     * @param objectMapper JSON 직렬화 및 역직렬화를 위한 ObjectMapper
     */
    public GitHubApiClient(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(CONNECT_TIMEOUT);
        requestFactory.setReadTimeout(READ_TIMEOUT);
        this.restClient = RestClient.builder()
            .requestFactory(requestFactory)
            .build();
    }

    /**
     * GitHub OAuth 인가 코드(code)로 Access Token을 교환합니다.
     */
    public String exchangeAccessToken(String clientId, String clientSecret, String code, String redirectUri) {
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("client_id", clientId);
        requestBody.put("client_secret", clientSecret);
        requestBody.put("code", code);
        if (redirectUri != null && !redirectUri.isBlank()) {
            requestBody.put("redirect_uri", redirectUri);
        }

        try {
            String response = restClient.post()
                .uri(GITHUB_OAUTH_TOKEN_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

            JsonNode node = objectMapper.readTree(response);
            if (node.has("error")) {
                String errorDescription = node.has("error_description")
                    ? node.get("error_description").asText()
                    : node.get("error").asText();
                log.warn("GitHub OAuth 토큰 교환 실패: {}", errorDescription);
                throw new GitHubOAuthFailedException("GitHub 인증에 실패했습니다: " + errorDescription);
            }

            JsonNode tokenNode = node.get("access_token");
            if (tokenNode == null || tokenNode.asText().isBlank()) {
                throw new GitHubOAuthFailedException("GitHub로부터 유효한 토큰을 발급받지 못했습니다.");
            }

            return tokenNode.asText();
        } catch (GitHubOAuthFailedException e) {
            throw e;
        } catch (Exception e) {
            log.error("GitHub OAuth 토큰 요청 중 네트워크 오류 발생", e);
            throw new GitHubOAuthFailedException("GitHub 인증 통신 중 오류가 발생했습니다.");
        }
    }

    /**
     * GitHub 사용자 프로필(로그인 ID, 닉네임, 아바타 URL)을 조회합니다.
     */
    public GitHubUserProfile getUserProfile(String accessToken) {
        try {
            return restClient.get()
                .uri(GITHUB_API_BASE_URL + "/user")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .header("X-GitHub-Api-Version", GITHUB_API_VERSION)
                .retrieve()
                .body(GitHubUserProfile.class);
        } catch (Exception e) {
            log.error("GitHub 사용자 프로필 조회 실패", e);
            throw new GitHubApiException("GitHub 사용자 프로필 정보를 불러오지 못했습니다.");
        }
    }

    /**
     * 잔디(기여도 그래프) 반영을 위해 사용자의 인증된 주 이메일(Primary Verified Email)을 조회합니다.
     */
    public Optional<String> getPrimaryVerifiedEmail(String accessToken) {
        try {
            List<GitHubEmail> emails = restClient.get()
                .uri(GITHUB_API_BASE_URL + "/user/emails")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .header("X-GitHub-Api-Version", GITHUB_API_VERSION)
                .retrieve()
                .body(new ParameterizedTypeReference<List<GitHubEmail>>() {});

            if (emails == null || emails.isEmpty()) {
                return Optional.empty();
            }

            // 1순위: primary 이면서 verified 인 이메일
            return emails.stream()
                .filter(e -> e.isPrimary() && e.isVerified())
                .map(GitHubEmail::getEmail)
                .findFirst()
                .or(() -> emails.stream()
                    .filter(GitHubEmail::isVerified)
                    .map(GitHubEmail::getEmail)
                    .findFirst());
        } catch (Exception e) {
            log.warn("GitHub 이메일 목록 조회 실패 (프로필 기본 이메일로 대체 시도)", e);
            return Optional.empty();
        }
    }

    /**
     * 사용자가 접근 가능한 GitHub 저장소 목록을 조회합니다.
     */
    public List<GitHubRepoResponse> getUserRepositories(String accessToken) {
        try {
            String response = restClient.get()
                .uri(GITHUB_API_BASE_URL + "/user/repos?type=all&sort=updated&per_page=100")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .header("X-GitHub-Api-Version", GITHUB_API_VERSION)
                .retrieve()
                .body(String.class);

            JsonNode arrayNode = objectMapper.readTree(response);
            List<GitHubRepoResponse> repos = new ArrayList<>();
            if (arrayNode.isArray()) {
                for (JsonNode item : arrayNode) {
                    repos.add(GitHubRepoResponse.builder()
                        .name(item.path("name").asText())
                        .fullName(item.path("full_name").asText())
                        .description(item.path("description").asText(null))
                        .isPrivate(item.path("private").asBoolean(false))
                        .defaultBranch(item.path("default_branch").asText("main"))
                        .build());
                }
            }
            return repos;
        } catch (Exception e) {
            log.error("GitHub 저장소 목록 조회 실패", e);
            throw new GitHubApiException("저장소 목록을 불러오지 못했습니다.");
        }
    }

    /**
     * 대상 저장소 브랜치 내 파일의 기존 SHA 값을 조회합니다. 파일이 없으면 Optional.empty()를 반환합니다.
     * 404 외의 오류(인증 실패, 권한 부족, 네트워크 오류 등) 발생 시 도메인 예외를 던집니다.
     *
     * @param accessToken GitHub Access Token
     * @param ownerAndRepo 저장소 소유자 및 저장소명 (owner/repo)
     * @param path 파일 경로
     * @param branch 대상 브랜치명
     * @return 파일 SHA 값 (파일이 없으면 Optional.empty())
     */
    public Optional<String> getFileSha(String accessToken, String ownerAndRepo, String path, String branch) {
        String cleanPath = path.startsWith("/") ? path.substring(1) : path;
        String encodedBranch = URLEncoder.encode(branch, StandardCharsets.UTF_8);
        String uri = String.format("%s/repos/%s/contents/%s?ref=%s", GITHUB_API_BASE_URL, ownerAndRepo, cleanPath,
            encodedBranch);

        try {
            String response = restClient.get()
                .uri(uri)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .header("X-GitHub-Api-Version", GITHUB_API_VERSION)
                .retrieve()
                .body(String.class);

            JsonNode node = objectMapper.readTree(response);
            return Optional.ofNullable(node.path("sha").asText(null));
        } catch (HttpClientErrorException.NotFound e) {
            return Optional.empty();
        } catch (RestClientResponseException e) {
            log.error("GitHub 파일 SHA 조회 실패 (HTTP {}): {} / {}", e.getStatusCode(), ownerAndRepo, cleanPath, e);
            throw new GitHubApiException(resolveErrorMessage(e.getStatusCode(), "GitHub 파일 정보 조회에 실패했습니다."));
        } catch (Exception e) {
            log.error("GitHub 파일 SHA 조회 중 예기치 않은 오류 발생: {} / {}", ownerAndRepo, cleanPath, e);
            throw new GitHubApiException("GitHub 파일 정보 조회 통신 중 오류가 발생했습니다.");
        }
    }

    /**
     * 마크다운 파일을 생성하거나 수정하여 GitHub 저장소에 커밋 및 푸시합니다.
     * committer와 author에 사용자 정보를 지정하여 GitHub 잔디(기여도 그래프)를 반영합니다.
     *
     * @return 생성된 커밋 SHA
     */
    public String createOrUpdateFile(
        String accessToken,
        String ownerAndRepo,
        String path,
        String branch,
        String message,
        String markdownContent,
        String sha,
        String authorName,
        String authorEmail) {

        String cleanPath = path.startsWith("/") ? path.substring(1) : path;
        String uri = String.format("%s/repos/%s/contents/%s", GITHUB_API_BASE_URL, ownerAndRepo, cleanPath);

        String base64Content = Base64.getEncoder().encodeToString(markdownContent.getBytes(StandardCharsets.UTF_8));

        Map<String, Object> body = new HashMap<>();
        body.put("message", message);
        body.put("content", base64Content);
        body.put("branch", branch);

        if (sha != null && !sha.isBlank()) {
            body.put("sha", sha);
        }

        if (authorName != null && authorEmail != null) {
            Map<String, String> authorInfo = Map.of("name", authorName, "email", authorEmail);
            body.put("committer", authorInfo);
            body.put("author", authorInfo);
        }

        try {
            String response = restClient.put()
                .uri(uri)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .header("X-GitHub-Api-Version", GITHUB_API_VERSION)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);

            JsonNode node = objectMapper.readTree(response);
            return node.path("commit").path("sha").asText();
        } catch (RestClientResponseException e) {
            log.error("GitHub 파일 커밋 푸시 실패 (HTTP {}): {} / {}", e.getStatusCode(), ownerAndRepo, cleanPath, e);
            throw new GitHubApiException(resolveErrorMessage(e.getStatusCode(), "GitHub 파일 커밋에 실패했습니다."));
        } catch (Exception e) {
            log.error("GitHub 파일 커밋 푸시 중 예기치 않은 오류 발생: {} / {}", ownerAndRepo, cleanPath, e);
            throw new GitHubApiException("GitHub 파일 커밋 통신 중 오류가 발생했습니다.");
        }
    }

    /**
     * GitHub 저장소에서 파일을 삭제 커밋합니다.
     *
     * @return 삭제 커밋 SHA
     */
    public String deleteFile(
        String accessToken,
        String ownerAndRepo,
        String path,
        String branch,
        String message,
        String sha,
        String authorName,
        String authorEmail) {

        String cleanPath = path.startsWith("/") ? path.substring(1) : path;
        String uri = String.format("%s/repos/%s/contents/%s", GITHUB_API_BASE_URL, ownerAndRepo, cleanPath);

        Map<String, Object> body = new HashMap<>();
        body.put("message", message);
        body.put("sha", sha);
        body.put("branch", branch);

        if (authorName != null && authorEmail != null) {
            Map<String, String> authorInfo = Map.of("name", authorName, "email", authorEmail);
            body.put("committer", authorInfo);
            body.put("author", authorInfo);
        }

        try {
            String response = restClient.method(org.springframework.http.HttpMethod.DELETE)
                .uri(uri)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .header("X-GitHub-Api-Version", GITHUB_API_VERSION)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);

            JsonNode node = objectMapper.readTree(response);
            return node.path("commit").path("sha").asText();
        } catch (RestClientResponseException e) {
            log.error("GitHub 파일 삭제 실패 (HTTP {}): {} / {}", e.getStatusCode(), ownerAndRepo, cleanPath, e);
            throw new GitHubApiException(resolveErrorMessage(e.getStatusCode(), "GitHub 파일 삭제에 실패했습니다."));
        } catch (Exception e) {
            log.error("GitHub 파일 삭제 중 예기치 않은 오류 발생: {} / {}", ownerAndRepo, cleanPath, e);
            throw new GitHubApiException("GitHub 파일 삭제 통신 중 오류가 발생했습니다.");
        }
    }

    /**
     * HTTP 응답 상태 코드에 따른 안전한 도메인 에러 메시지를 반환합니다.
     * 내부 구현 정보나 원본 GitHub 응답 본문의 노출을 방지합니다.
     *
     * @param status HTTP 상태 코드
     * @param defaultMessage 기본 대체 메시지
     * @return 도메인 에러 메시지
     */
    private String resolveErrorMessage(HttpStatusCode status, String defaultMessage) {
        int code = status.value();
        if (code == 401) {
            return "GitHub 인증이 만료되었거나 토큰이 유효하지 않습니다.";
        }
        if (code == 403) {
            return "GitHub 저장소 접근 또는 쓰기 권한이 없습니다.";
        }
        if (code == 404) {
            return "GitHub 저장소 또는 파일 경로를 찾을 수 없습니다.";
        }
        if (code == 409) {
            return "GitHub 파일 충돌이 발생했습니다.";
        }
        if (code == 422) {
            return "GitHub 요청 데이터가 유효하지 않습니다.";
        }
        if (code == 429) {
            return "GitHub API 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.";
        }
        if (code >= 500) {
            return "GitHub 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
        }
        return defaultMessage;
    }

    /**
     * 연동 해제 시 GitHub 원격 OAuth App 인가를 즉시 폐기(Revoke)합니다.
     */
    public void revokeAppGrant(String clientId, String clientSecret, String accessToken) {
        if (clientId == null || clientId.isBlank() || clientSecret == null || clientSecret.isBlank()) {
            return;
        }

        String uri = String.format("%s/applications/%s/grant", GITHUB_API_BASE_URL, clientId);
        String authHeader = "Basic " + Base64.getEncoder().encodeToString(
            (clientId + ":" + clientSecret).getBytes(StandardCharsets.UTF_8));

        Map<String, String> body = Map.of("access_token", accessToken);

        try {
            restClient.method(org.springframework.http.HttpMethod.DELETE)
                .uri(uri)
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .header("X-GitHub-Api-Version", GITHUB_API_VERSION)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toBodilessEntity();
            log.info("GitHub 원격 OAuth App 인가 폐기(Revoke) 성공");
        } catch (Exception e) {
            log.warn("GitHub 원격 인가 폐기 실패 (이미 취소되었거나 오류): {}", e.getMessage());
        }
    }

    @Getter
    @NoArgsConstructor
    public static class GitHubUserProfile {
        private String login;
        private String name;
        private String email;
        @JsonProperty("avatar_url")
        private String avatarUrl;
    }

    @Getter
    @NoArgsConstructor
    public static class GitHubEmail {
        private String email;
        private boolean primary;
        private boolean verified;
    }
}
