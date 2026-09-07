// 서버(RSC/route)에서 BASE_API_URL 미설정 시 쓰는 기본값(로컬 개발용).
// 운영/스테이징에서는 .env 의 BASE_API_URL 로 실제 백엔드 주소를 주입한다.
const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1';

// base URL 끝의 /를 제거해서 endpoint를 붙일 때 //가 생기지 않게 한다.
function trimTrailingSlashes(value) {
  return value.replace(/\/+$/, '');
}

export function getApiBaseUrl() {
  // 클라이언트(브라우저):
  // - 기본: 상대경로 "/api/v1" → next.config 의 rewrites 프록시가 백엔드로 포워딩(same-origin).
  // - 백엔드 직접 호출로 전환 시: NEXT_PUBLIC_BASE_API_URL 만 설정하면 코드 변경 없이 절대주소 사용.
  //   (단, 백엔드 HTTPS + CORS 가 준비된 뒤에만 켤 것 — 아니면 mixed-content/CORS 로 차단됨)
  if (typeof window !== 'undefined') {
    const publicBaseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
    if (publicBaseUrl) return trimTrailingSlashes(publicBaseUrl.trim());
    return '/api/v1';
  }

  // 서버(RSC/route): BASE_API_URL 로 외부 백엔드를 직접 호출(서버 간 통신이라 CORS 무관).
  const baseUrl = process.env.BASE_API_URL || DEFAULT_API_BASE_URL;
  return trimTrailingSlashes(baseUrl.trim());
}
