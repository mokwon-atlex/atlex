// 회원가입 mutation 훅. 컴포넌트에서 mutate({ userId, password, name, email }) 을 호출하면 된다.
//
// ── 로그인 훅(useLogin)과 달리 onSuccess 에서 store 를 갱신하지 않는 이유 ──
// 회원가입 후 자동 로그인 여부는 UX 정책에 따라 달라질 수 있다.
// (예: "가입 후 이메일 인증이 필요한 경우" 자동 로그인 불가)
// 따라서 가입 성공 후 어떤 후처리를 할지는 이 훅을 호출하는 컴포넌트가 options.onSuccess 로 결정한다.

'use client';

import { useMutation } from '@tanstack/react-query';
import { signupApi } from '@/lib/api/auth';

// mutate({ userId, password, name, email }) — 페이로드 shape 은 백엔드 /auth/signup 명세를 따른다.
export function useSignup(options) {
  return useMutation({
    // signupApi 를 그대로 mutationFn 으로 쓴다. 변환 없이 받은 payload 를 API 에 전달한다.
    mutationFn: signupApi,
    ...options,
  });
}
