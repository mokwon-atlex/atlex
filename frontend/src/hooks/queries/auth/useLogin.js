// 로그인 mutation 훅. 컴포넌트에서 mutate({ userId, password }) 를 호출하면 된다.
//
// 내부 처리 순서:
//   1) mutationFn: /auth/login API 를 호출해 accessToken + refreshToken + userId 를 받아온다.
//   2) onSuccess:  받은 토큰/유저를 zustand store 에 저장한다(store 에 저장해야 이후 API 요청에 자동으로 토큰이 붙는다).
//
// ── mutationFn 과 onSuccess 를 분리한 이유 ──
// TanStack Query 의 설계 원칙상 mutationFn 은 "API 호출 + 데이터 반환"만 담당하고,
// 전역 상태 변경 같은 부수효과(side effect)는 onSuccess 에서 처리하는 것이 권장된다.
// 이렇게 하면 TanStack Query 가 재시도·캐시 등을 예측 가능하게 제어할 수 있다.
//
// ── /users 프로필을 따로 조회하지 않는 이유 ──
// 현재 앱이 store 의 user 에서 사용하는 값은 userId 하나뿐(ProfileMenu, AdminActions).
// 로그인 응답에 이미 포함되어 있어 별도 조회가 불필요하고,
// 백엔드 GET /users/{id} 는 숫자 id 만 받아 문자열 userId 로는 400 이 난다.
// 추후 name/email 등이 필요해지면 토큰 저장 완료 후 별도 시점에 조회한다.
//
// ── 라우팅(router.push 등)은 이 훅에 없는 이유 ──
// 로그인 후 어디로 이동할지는 이 훅을 호출하는 컴포넌트마다 다를 수 있다.
// 훅을 재사용 가능하게 유지하기 위해 라우팅은 호출부(컴포넌트) 책임으로 남긴다.

'use client';

import { useMutation } from '@tanstack/react-query';
import { loginApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';

export function useLogin(options) {
  // zustand store 에서 "로그인 상태로 전환" 함수를 가져온다.
  const setLoggedIn = useAuthStore((s) => s.login);

  return useMutation({
    // Step 1: API 를 호출하고 받은 값을 그대로 반환한다. store 변경은 여기서 하지 않는다.
    mutationFn: async ({ userId, password }) => {
      const { accessToken, refreshToken, userId: loggedInUserId } = await loginApi({
        userId,
        password,
      });
      // loggedInUserId: 백엔드가 내려준 값. 없을 경우 입력한 userId 를 폴백으로 사용한다.
      const user = { userId: loggedInUserId ?? userId };
      return { user, accessToken, refreshToken };
    },

    // 외부에서 전달한 옵션(예: onError)을 그대로 이어받는다. 단, onSuccess 는 아래에서 덮어쓴다.
    ...options,

    // Step 2: API 성공 후 전역 store 에 토큰/유저를 저장한다.
    // store 에 accessToken 이 들어가야 이후 API 요청에 Authorization 헤더가 자동으로 붙는다.
    // options.onSuccess 가 있으면 store 저장 뒤에 이어서 호출해 외부 동작이 누락되지 않게 한다.
    onSuccess: async (data, variables, context) => {
      setLoggedIn({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
      if (options?.onSuccess) {
        await options.onSuccess(data, variables, context);
      }
    },
  });
}
