// 토큰부 — 인증 토큰의 저장 브리지 + accessToken 자동 재발급 + 401 재시도.
// axios 인스턴스는 import 하지 않고 파라미터로 주입받는다(client.js ↔ tokens.js 순환참조 회피).

// 재발급 요청에 붙는 config 플래그. 이 플래그가 달린 요청에는 만료된 accessToken 을 첨부하지 않고,
// 401 이 나도 재귀 재발급하지 않는다. client.js 요청 인터셉터와 공유하므로 상수로 둔다.
export const SKIP_AUTH_REFRESH = '_skipAuthRefresh';

// 주입받은 값이 함수가 아니면 안전한 fallback 으로 대체한다(아래 setter 들의 공통 가드).
function toFn(fn, fallback) {
  return typeof fn === 'function' ? fn : fallback;
}

// ===== 저장 브리지 =====
// lib/api/* 가 store 모듈을 직접 import 하면 순환참조가 생기므로, store 가 자기 getter/콜백을
// 여기에 주입한다. store 부트스트랩(store/authStore.js 모듈 로드) 시점에 1회 주입.
// 서버 컴포넌트 경로에서는 getter 가 null 을 반환하므로 안전.
let accessTokenGetter = () => null;
let refreshTokenGetter = () => null;
let tokensRefreshedHandler = () => {};
let refreshFailedHandler = () => {};

export const getAccessToken = () => accessTokenGetter();
export const getRefreshToken = () => refreshTokenGetter();

export function setAccessTokenGetter(fn) {
  accessTokenGetter = toFn(fn, () => null);
}
export function setRefreshTokenGetter(fn) {
  refreshTokenGetter = toFn(fn, () => null);
}
// 재발급 성공 시 새 토큰({ accessToken, refreshToken? }) 을 store 에 반영.
export function setOnTokensRefreshed(fn) {
  tokensRefreshedHandler = toFn(fn, () => {});
}
// 재발급 실패(만료/무효) 시 호출 — 보통 로그아웃 처리.
export function setOnRefreshFailed(fn) {
  refreshFailedHandler = toFn(fn, () => {});
}

// ===== 재발급 + 401 재시도 =====
// client 를 주입받아 reissue 호출과 원요청 재시도에 사용한다.
export function createTokenRefresher(client) {
  // single-flight: 동시에 여러 요청이 401 을 받아도 refresh 는 1회만 수행하고 모두 그 결과를 공유한다.
  let refreshPromise = null;

  function refreshAccessToken() {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('리프레시 토큰이 없습니다.');
        // POST /auth/reissue { refreshToken } → data { accessToken, refreshToken, userId } (두 토큰 회전).
        const data = await client.post('/auth/reissue', { refreshToken }, { [SKIP_AUTH_REFRESH]: true });
        tokensRefreshedHandler(data); // { accessToken, refreshToken }
        return data?.accessToken ?? null;
      })()
        .catch((err) => {
          refreshFailedHandler();
          throw err;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }
    return refreshPromise;
  }

  // 토큰을 재발급하고 원요청을 1회 재시도한다. 호출부(client.js)가 401 일 때만 호출한다.
  // 재시도 응답을 반환하고, 재시도 대상이 아니거나 재발급 실패 시 null 을 반환한다(→ 공통 에러 처리로).
  // - _retry: 이미 재시도한 요청은 다시 시도하지 않음(무한루프 방지).
  // - SKIP_AUTH_REFRESH: reissue 요청 자체의 401 은 건너뜀.
  async function retryWithRefreshedToken(error) {
    const original = error.config;
    if (!original || original._retry || original[SKIP_AUTH_REFRESH] || !getRefreshToken()) {
      return null;
    }

    original._retry = true;
    try {
      await refreshAccessToken(); // 성공 시 store 의 accessToken 이 새 값으로 갱신됨
      // 원요청의 stale Authorization 을 제거 → request 인터셉터가 갱신된 store 토큰으로 다시 채운다.
      // (AxiosHeaders 인스턴스/일반 객체 모두 대응)
      if (original.headers) {
        if (typeof original.headers.delete === 'function') {
          original.headers.delete('Authorization');
        } else {
          delete original.headers.Authorization;
        }
      }
      return client(original);
    } catch {
      // refresh 실패 → refreshFailedHandler 는 이미 호출됨. null 반환해 공통 에러 처리로 넘긴다.
      return null;
    }
  }

  return { retryWithRefreshedToken };
}
