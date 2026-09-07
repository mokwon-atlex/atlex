'use client';

// 로그인한 사용자만 children 을 볼 수 있게 하는 가드 컴포넌트.
// 미로그인 시 redirectTo(기본 /account)로 보내고, 그동안 보호 콘텐츠는 렌더하지 않는다.
//
// ── 왜 클라이언트 가드인가 ──
// 인증 상태는 zustand persist(localStorage)에 저장돼 서버/미들웨어에서는 읽을 수 없다.
// 따라서 라우트 접근 차단은 클라이언트에서 처리한다.
//
// ── mounted 가드가 필요한 이유 ──
// 서버 렌더 시점엔 localStorage 가 없어 항상 "미로그인"으로 그려진다. 마운트 전에 판단하면
// 로그인 사용자에게도 깜빡임/오작동이 생기므로, 마운트 이후에만 인증 여부를 확정한다.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function RequireAuth({ children, redirectTo = '/account' }) {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 마운트 후 미로그인으로 확정되면 로그인 페이지로 보낸다.
    if (mounted && !isLoggedIn) {
      router.replace(redirectTo);
    }
  }, [mounted, isLoggedIn, redirectTo, router]);

  // 인증 확인 전(서버/마운트 직전)이거나 미로그인이면 보호 콘텐츠를 그리지 않는다.
  if (!mounted || !isLoggedIn) return null;

  return children;
}
