// 로그아웃 mutation 훅. 컴포넌트에서 mutate() 를 호출하면 된다.
//
// ── store 를 항상 비우는 이유 ──
// 네트워크가 끊기거나 서버 에러가 나도 로컬 로그인 상태는 반드시 초기화해야 한다.
// 만약 API 성공 시에만 store 를 비운다면, 서버 문제로 사용자가 로그아웃을 못 하는 상황이 생긴다.
// try...finally 를 쓰면 API 결과와 무관하게 clearAuth() 가 항상 실행된다.
//
// ── 에러를 삼키지 않는 이유 ──
// clearAuth 는 성공했지만 API 에러가 발생했다면 호출부(컴포넌트)가 알 필요가 있을 수 있다.
// (예: "서버 로그아웃에 실패했습니다" 토스트를 띄우고 싶을 때)
// finally 블록에서 에러를 잡지 않으면 JavaScript 가 자동으로 에러를 전파(re-throw)해 준다.
//
// ── 라우팅은 이 훅에 없는 이유 ──
// 로그아웃 후 어디로 이동할지는 호출하는 컴포넌트마다 다를 수 있으므로 호출부 책임으로 남긴다.

'use client';

import { useMutation } from '@tanstack/react-query';
import { logoutApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';

export function useLogout(options) {
  // zustand store 에서 "로그아웃 상태로 전환" 함수를 가져온다(토큰 + 유저 정보 초기화).
  const clearAuth = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: async () => {
      try {
        await logoutApi(); // 서버에 로그아웃 요청(서버 측 토큰 무효화).
      } finally {
        // API 성공/실패 여부와 무관하게 항상 로컬 인증 상태를 비운다.
        // 에러가 있었다면 finally 실행 후 자동으로 에러가 전파된다.
        clearAuth();
      }
    },
    ...options,
  });
}
