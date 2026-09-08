// 인증 상태 store.
// localStorage(`auth-storage`) 에 토큰을 영속화하고,
// 모듈 로드 시점에 api 토큰 브리지(lib/api/tokens.js)에 토큰 getter / 재발급 콜백을 주입한다.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  setAccessTokenGetter,
  setRefreshTokenGetter,
  setOnTokensRefreshed,
  setOnRefreshFailed,
} from '@/lib/api/tokens';

const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      login: ({ user, accessToken, refreshToken }) =>
        set({ isLoggedIn: true, user, accessToken, refreshToken: refreshToken ?? null }),
      logout: () => set({ isLoggedIn: false, user: null, accessToken: null, refreshToken: null }),
      // 토큰 재발급 시 accessToken(+회전된 refreshToken) 만 갱신. 값이 없으면 기존값 유지.
      setTokens: ({ accessToken, refreshToken } = {}) =>
        set((s) => ({
          accessToken: accessToken ?? s.accessToken,
          refreshToken: refreshToken ?? s.refreshToken,
        })),
    }),
    { name: 'auth-storage' },
  ),
);

// module-level side-effect 로 1회 주입한다. (zustand 자체가 client-only 이므로 RSC 영향 없음)
setAccessTokenGetter(() => useAuthStore.getState().accessToken);
setRefreshTokenGetter(() => useAuthStore.getState().refreshToken);
// 401 자동 재발급 성공 → 새 토큰 저장 / 실패 → 로그아웃.
setOnTokensRefreshed((tokens) => useAuthStore.getState().setTokens(tokens));
setOnRefreshFailed(() => useAuthStore.getState().logout());

// ── 탭 간 인증 동기화 ──
// 다른 탭에서 로그인/로그아웃하거나 외부에서 localStorage 의 auth-storage 가 바뀌면,
// 브라우저가 "다른 탭들"에 storage 이벤트를 전달한다(이벤트를 일으킨 탭에는 안 옴).
// 이를 받아 메모리 store 를 최신 localStorage 와 맞춘다. RequireAuth 가 isLoggedIn 을
// 구독하므로, 이 동기화만으로 보호 페이지가 즉시 반응(미로그인 시 리다이렉트)한다.
if (typeof window !== 'undefined') {
  // dev HMR 로 이 모듈이 재평가될 때 리스너가 중복 등록되는 것을 막는다.
  // 이전 핸들러를 먼저 제거해, 항상 정확히 하나(최신 코드)만 유지한다.
  if (window.__authStorageHandler) {
    window.removeEventListener('storage', window.__authStorageHandler);
  }

  const handleStorage = (event) => {
    if (event.key !== 'auth-storage') return;
    if (event.newValue === null) {
      // 스토리지가 통째로 삭제된 경우 → 로그아웃 상태로 정리.
      useAuthStore.getState().logout();
    } else {
      // 다른 탭의 변경(로그인/로그아웃)을 메모리에 반영.
      useAuthStore.persist.rehydrate();
    }
  };

  window.addEventListener('storage', handleStorage);
  window.__authStorageHandler = handleStorage;
}

export { useAuthStore };
