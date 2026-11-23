'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Header from '@/components/common/layout/Header';
import { Button } from '@/components/common/ui/button';
import { Textfield } from '@/components/common/ui/textfield';
import { AuthHero } from '@/components/domain/auth/AuthHero';
import { LoginLogo } from '@/components/domain/auth/login/feature/LoginLogo';
import { OAuthOnboardingForm } from '@/components/domain/auth/oauth/OAuthOnboardingForm';
import { useExchangeOAuth2Code } from '@/hooks/queries/auth/useOAuth2Auth';

const ERROR_MESSAGES = {
  account_disabled: '비활성화된 계정입니다. 관리자에게 문의해주세요.',
  account_locked: '보안상의 이유로 일시 잠긴 계정입니다. 잠시 후 다시 시도해주세요.',
  unsupported_provider: '지원하지 않는 소셜 로그인 제공자입니다.',
  invalid_user_info: '소셜 계정 정보를 가져오지 못했습니다.',
  oauth2_failed: '소셜 로그인에 실패했습니다. 다시 시도해주세요.',
};

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutateAsync: exchangeCode } = useExchangeOAuth2Code();

  const code = searchParams.get('code');
  const onboardingToken = searchParams.get('onboardingToken');
  const provider = searchParams.get('provider') ?? '';
  const email = searchParams.get('email') ?? '';
  const suggestedName = searchParams.get('suggestedName') ?? '';
  const errorParam = searchParams.get('error');

  const [exchangeError, setExchangeError] = useState('');
  const exchangedRef = useRef(false);

  useEffect(() => {
    if (!code || exchangedRef.current) return;
    exchangedRef.current = true;

    exchangeCode({ code })
      .then(() => {
        router.replace('/');
      })
      .catch((err) => {
        setExchangeError(err?.message ?? '소셜 로그인 토큰 교환에 실패했습니다.');
      });
  }, [code, exchangeCode, router]);

  if (errorParam || exchangeError || (!code && !onboardingToken)) {
    const message =
      exchangeError ||
      (errorParam
        ? (ERROR_MESSAGES[errorParam] ?? ERROR_MESSAGES.oauth2_failed)
        : '유효하지 않은 OAuth2 콜백 요청입니다.');

    return (
      <section className="flex items-center justify-center py-6">
        <div className="w-full rounded-lg border border-border/80 bg-card p-6 shadow-2xs lg:p-7">
          <LoginLogo />
          <div className="mt-5 border-b border-border/70 pb-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">로그인 실패</h2>
            <Textfield variant="muted" size="sm" className="mt-2 leading-6">
              {message}
            </Textfield>
          </div>
          <Button
            type="button"
            onClick={() => router.replace('/account')}
            className="mt-6 h-10 w-full rounded-lg text-sm font-bold"
          >
            로그인 화면으로 돌아가기
          </Button>
        </div>
      </section>
    );
  }

  if (onboardingToken) {
    return (
      <section className="flex items-center justify-center py-6">
        <div className="w-full rounded-lg border border-border/80 bg-card p-6 shadow-2xs lg:p-7">
          <LoginLogo />
          <div className="mt-5 border-b border-border/70 pb-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">프로필 초기 설정</h2>
            <Textfield variant="muted" size="sm" className="mt-2 leading-6">
              Atlex 블로그에서 사용할 아이디와 닉네임을 설정하고 약관에 동의해주세요.
            </Textfield>
          </div>
          <OAuthOnboardingForm
            onboardingToken={onboardingToken}
            provider={provider}
            initialEmail={email}
            suggestedName={suggestedName}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="flex items-center justify-center py-6">
      <div className="w-full rounded-lg border border-border/80 bg-card p-6 shadow-2xs lg:p-7">
        <LoginLogo />
        <div className="mt-5 pb-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">로그인 처리 중</h2>
          <Textfield variant="muted" size="sm" className="mt-2 leading-6">
            소셜 계정을 확인하고 있습니다. 잠시만 기다려주세요...
          </Textfield>
        </div>
      </div>
    </section>
  );
}

export default function OAuthCallbackPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,var(--muted),var(--background)_45%)]">
      <Header />
      <div className="mx-auto flex w-full max-w-content-narrow flex-1 flex-col px-5 pt-7 sm:px-8 lg:px-10">
        <div className="grid flex-1 grid-cols-1 items-center gap-14 py-8 lg:grid-cols-[1.05fr_480px]">
          <AuthHero />
          <Suspense
            fallback={
              <div className="w-full rounded-lg border border-border/80 bg-card p-6 shadow-2xs lg:p-7">
                <p className="text-sm text-muted-foreground">소셜 로그인 정보를 불러오는 중...</p>
              </div>
            }
          >
            <OAuthCallbackContent />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
