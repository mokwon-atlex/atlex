import axios from 'axios';
import { getApiBaseUrl } from '@/lib/api/baseUrl';
import { getAccessToken, createTokenRefresher, SKIP_AUTH_REFRESH } from '@/lib/api/tokens';
import { isEnvelope, createApiError } from '@/lib/api/envelope';

// 공통 axios 인스턴스. 모든 lib/api/* 호출이 이 인스턴스를 거친다.
// 이 파일은 "조립"만 담당한다 — 토큰 로직은 tokens.js, envelope 처리는 envelope.js 에 있다.
//
// ── 요청/응답 생명주기 한눈에 보기 ──
//   1) 요청 인터셉터:   매 요청에 baseURL 을 다시 주입하고 accessToken 을 Bearer 로 첨부.
//   2) 응답 성공:        envelope({code,message,data,errors}) 를 풀어 data 만 호출부에 돌려줌.
//   3) 응답 실패(401):   accessToken 만료로 보고 refreshToken 으로 재발급 → 원요청 1회 재시도.
//   4) 응답 실패(그 외): envelope 의 code/message 를 담은 Error 로 변환해 throw.
export const apiClient = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

const { retryWithRefreshedToken } = createTokenRefresher(apiClient);

// (1) 요청: baseURL 주입 + accessToken 첨부.
apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();

  // 인증 토큰 자동 첨부 (브라우저 환경만). 호출부가 명시한 Authorization 은 덮지 않는다.
  // SKIP_AUTH_REFRESH 플래그가 있으면 기존 토큰을 붙이지 않는다.
  // 이 플래그는 두 가지를 동시에 끈다: (1) 여기서 토큰 자동 첨부, (2) 응답 401 시 재발급 재시도.
  // 사용처: reissue(재귀 재발급 방지), login/signup(인증 전이라 stale 토큰을 붙이면
  //   백엔드가 무효 토큰을 먼저 거부해 요청 자체가 실패함).
  if (typeof window !== 'undefined' && !config[SKIP_AUTH_REFRESH] && !config.headers?.Authorization) {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// (2~4) 응답: 성공 envelope unwrap / 401 재발급 후 재시도 / 그 외 envelope 에러 변환.
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (isEnvelope(body)) {
      if (body.code === 'SUCCESS') return body.data;
      throw createApiError(body, response.status);
    }
    return body;
  },
  async (error) => {
    // 401: accessToken 만료로 보고 재발급 후 원요청 1회 재시도.
    if (error.response?.status === 401) {
      const retried = await retryWithRefreshedToken(error);
      if (retried) return retried;
    }

    // 백엔드 envelope 에러: code/message 를 담아 throw.
    const body = error.response?.data;
    if (isEnvelope(body)) throw createApiError(body, error.response.status);

    // 그 외(네트워크 단절 등): 원본 에러 그대로 throw.
    throw error;
  },
);
