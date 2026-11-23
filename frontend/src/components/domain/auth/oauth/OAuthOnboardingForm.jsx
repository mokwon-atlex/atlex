'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/common/ui/button';
import { Checkbox } from '@/components/common/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/components/common/ui/field';
import { Input } from '@/components/common/ui/input';
import { UserIdField } from '@/components/common/layout/UserIdField';
import { NicknameField } from '@/components/common/layout/NicknameField';
import { useCompleteOAuth2Onboarding } from '@/hooks/queries/auth/useOAuth2Auth';

const PROVIDER_LABELS = {
  GITHUB: 'GitHub',
  GOOGLE: 'Google',
  KAKAO: 'Kakao',
};

function sanitizeNickname(value) {
  if (!value) return '';
  return value.replace(/[^a-zA-Z가-힣0-9]/g, '').slice(0, 10);
}

/**
 * 신규 소셜 사용자의 초기 계정 정보(블로그 아이디·닉네임·약관 동의)를 입력받는 온보딩 폼입니다.
 */
function OAuthOnboardingForm({ onboardingToken, provider, initialEmail, suggestedName }) {
  const router = useRouter();
  const { mutateAsync: completeOnboarding, isPending } = useCompleteOAuth2Onboarding();

  const [userId, setUserId] = useState('');
  const [name, setName] = useState(() => sanitizeNickname(suggestedName));
  const [email, setEmail] = useState(initialEmail ?? '');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);
  const [error, setError] = useState('');

  const allAgreed = termsAgreed && privacyAgreed && marketingAgreed;
  const canSubmit =
    Boolean(userId.trim()) &&
    Boolean(name.trim()) &&
    (Boolean(initialEmail) || Boolean(email.trim())) &&
    termsAgreed &&
    privacyAgreed;

  function handleAllChange(checked) {
    const next = checked === true;
    setTermsAgreed(next);
    setPrivacyAgreed(next);
    setMarketingAgreed(next);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await completeOnboarding({
        onboardingToken,
        userId: userId.trim(),
        name: name.trim(),
        email: initialEmail ? undefined : email.trim(),
        termsAgreed,
        privacyAgreed,
        marketingAgreed,
      });
      router.replace('/');
    } catch (err) {
      setError(err?.message ?? '초기 설정 완료에 실패했습니다. 입력 내용을 확인해주세요.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="mb-5 rounded-lg border border-border/70 bg-muted/35 px-3.5 py-2.5 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{PROVIDER_LABELS[provider] ?? provider}</span> 계정이
        연결되었습니다.
        {initialEmail ? ` (${initialEmail})` : ' 이메일과 프로필 정보를 입력해주세요.'}
      </div>

      <FieldGroup className="gap-4">
        <UserIdField value={userId} onChange={(e) => setUserId(e.target.value)} showCheckButton={false} />

        <NicknameField value={name} onChange={(e) => setName(e.target.value)} showCheckButton={false} />

        {!initialEmail && (
          <Field>
            <FieldLabel htmlFor="oauth-onboarding-email">이메일</FieldLabel>
            <Input
              id="oauth-onboarding-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
        )}

        <div className="space-y-2.5 rounded-xl border border-border/70 bg-muted/20 p-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-foreground">
            <Checkbox checked={allAgreed} onCheckedChange={handleAllChange} />
            전체 약관에 동의합니다
          </label>
          <div className="border-t border-border/60 pt-2.5 space-y-2 text-xs text-foreground">
            <label className="flex cursor-pointer items-center gap-2.5">
              <Checkbox checked={termsAgreed} onCheckedChange={(v) => setTermsAgreed(v === true)} />
              <span>
                이용약관 동의 <span className="text-destructive">(필수)</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5">
              <Checkbox checked={privacyAgreed} onCheckedChange={(v) => setPrivacyAgreed(v === true)} />
              <span>
                개인정보처리방침 동의 <span className="text-destructive">(필수)</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-muted-foreground">
              <Checkbox checked={marketingAgreed} onCheckedChange={(v) => setMarketingAgreed(v === true)} />
              <span>마케팅 정보 수신 동의 (선택)</span>
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.replace('/account')}
            className="h-10 flex-1 rounded-lg text-sm font-bold"
          >
            취소
          </Button>
          <Button type="submit" disabled={!canSubmit || isPending} className="h-10 flex-1 rounded-lg text-sm font-bold">
            {isPending ? '저장 중...' : '시작하기'}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

export { OAuthOnboardingForm };
