'use client';

import { SocialLoginButtons } from '@/components/domain/auth/login/feature/SocialLoginButtons';

/**
 * 일반 사용자 로그인 화면의 폼 컴포넌트입니다.
 * GitHub, Google, Kakao OAuth2 소셜 로그인만 제공합니다.
 */
function LoginForm() {
  return (
    <div className="mt-6 space-y-5">
      <SocialLoginButtons />

      <p className="border-t border-border/60 pt-4 text-center text-xs leading-5 text-muted-foreground">
        최초 소셜 로그인 시 간단한 프로필 설정 및 약관 동의 후 바로 Atlex를 이용할 수 있습니다.
      </p>
    </div>
  );
}

export { LoginForm };
