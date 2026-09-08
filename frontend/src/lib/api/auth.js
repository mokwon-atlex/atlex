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

// POST /auth/logout
// Authorization 헤더는 client.js 의 request interceptor 가 store 에서 토큰을 읽어 자동 첨부한다.
export function logoutApi() {
  return apiClient.post('/auth/logout');
}

// POST /auth/signup
// _skipAuthRefresh: 회원가입도 인증 전 엔드포인트라 기존 토큰을 붙이지 않는다(loginApi 와 동일 이유).
export function signupApi(payload) {
  return apiClient.post('/auth/signup', payload, { [SKIP_AUTH_REFRESH]: true });
}
