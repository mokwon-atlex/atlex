// 인증 관련 raw API 호출. 매핑/정책 없이 axios 응답(envelope 푼 상태)을 그대로 반환한다.
// 백엔드 endpoint 가 바뀌면 이 파일의 URL/메서드만 수정한다.

import { apiClient } from '@/lib/api/client';
import { SKIP_AUTH_REFRESH } from '@/lib/api/tokens';

// POST /auth/login
// _skipAuthRefresh: 인증 전 엔드포인트라 store 에 남은 (만료/무효) accessToken 을 붙이지 않는다.
//   - 붙이면 백엔드가 헤더의 무효 토큰을 먼저 거부해 로그인 자체가 401 이 된다(자격증명 검사 전에 실패).
//   - 또한 로그인 실패(401)는 "비밀번호 틀림"이지 "토큰 만료"가 아니므로 재발급 흐름을 타면 안 된다.
export function loginApi({ userId, password }) {
  return apiClient.post('/auth/login', { userId, password }, { [SKIP_AUTH_REFRESH]: true });
}

// POST /auth/admin/login
// 관리자 전용 로그인 엔드포인트. ADMIN 권한이 아니면 403 이 반환된다.
export function adminLoginApi({ userId, password }) {
  return apiClient.post('/auth/admin/login', { userId, password }, { [SKIP_AUTH_REFRESH]: true });
}

// POST /auth/logout
// Authorization 헤더는 client.js 의 request interceptor 가 store 에서 토큰을 읽어 자동 첨부한다.
export function logoutApi() {
  return apiClient.post('/auth/logout');
}

// POST /auth/signup (Deprecated - OAuth2 온보딩으로 전환)
// _skipAuthRefresh: 회원가입도 인증 전 엔드포인트라 기존 토큰을 붙이지 않는다(loginApi 와 동일 이유).
export function signupApi(payload) {
  return apiClient.post('/auth/signup', payload, { [SKIP_AUTH_REFRESH]: true });
}

// POST /auth/oauth2/exchange
// OAuth2 콜백으로 받은 일회용 코드를 JWT 액세스·리프레시 토큰으로 교환한다.
export function exchangeOAuth2CodeApi({ code }) {
  return apiClient.post('/auth/oauth2/exchange', { code }, { [SKIP_AUTH_REFRESH]: true });
}

// POST /auth/oauth2/onboarding
// 신규 소셜 사용자의 초기 프로필 및 약관 동의를 완료하고 JWT 토큰을 발급받는다.
export function completeOAuth2OnboardingApi(payload) {
  return apiClient.post('/auth/oauth2/onboarding', payload, { [SKIP_AUTH_REFRESH]: true });
}

// GET /auth/oauth2/check
// 온보딩 단계에서 아이디(userId) 또는 닉네임(name) 사용 가능 여부를 조회한다.
export function checkOAuth2AvailabilityApi({ userId, name }) {
  return apiClient.get('/auth/oauth2/check', {
    params: {
      ...(userId ? { userId } : {}),
      ...(name ? { name } : {}),
    },
    [SKIP_AUTH_REFRESH]: true,
  });
}

// OAuth2 제공자별 백엔드 인가 엔드포인트 경로 반환
export function getOAuth2AuthorizationUrl(provider) {
  return `/oauth2/authorization/${provider}`;
}
