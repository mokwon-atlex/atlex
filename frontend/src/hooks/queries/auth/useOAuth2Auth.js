'use client';

import { useMutation } from '@tanstack/react-query';
import { completeOAuth2OnboardingApi, exchangeOAuth2CodeApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';

/**
 * OAuth2 일회용 인가 코드를 JWT 토큰으로 교환하고 전역 인증 스토어에 반영하는 훅입니다.
 */
export function useExchangeOAuth2Code(options) {
  const setLoggedIn = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: async ({ code }) => {
      const { accessToken, refreshToken, userId, role } = await exchangeOAuth2CodeApi({ code });
      return {
        user: { userId, role: role ?? 'USER' },
        accessToken,
        refreshToken,
      };
    },
    ...options,
    onSuccess: async (data, variables, context) => {
      setLoggedIn({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
      if (options?.onSuccess) {
        await options.onSuccess(data, variables, context);
      }
    },
  });
}

/**
 * 신규 소셜 사용자의 온보딩을 완료하고 JWT 토큰을 발급받아 전역 인증 스토어에 저장하는 훅입니다.
 */
export function useCompleteOAuth2Onboarding(options) {
  const setLoggedIn = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: async (payload) => {
      const { accessToken, refreshToken, userId, role } = await completeOAuth2OnboardingApi(payload);
      return {
        user: { userId: userId ?? payload.userId, role: role ?? 'USER' },
        accessToken,
        refreshToken,
      };
    },
    ...options,
    onSuccess: async (data, variables, context) => {
      setLoggedIn({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
      if (options?.onSuccess) {
        await options.onSuccess(data, variables, context);
      }
    },
  });
}
