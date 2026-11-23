'use client';

import { useMutation } from '@tanstack/react-query';
import { adminLoginApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';

/**
 * 관리자 전용 로그인(/auth/admin/login) 뮤테이션 훅입니다.
 */
export function useAdminLogin(options) {
  const setLoggedIn = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: async ({ userId, password }) => {
      const { accessToken, refreshToken, userId: loggedInUserId, role } = await adminLoginApi({ userId, password });
      return {
        user: { userId: loggedInUserId ?? userId, role: role ?? 'ADMIN' },
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
