'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { FieldError } from '@/components/common/ui/field';
import {
  ProfileSettingEmailField,
  ProfileSettingImageField,
  ProfileSettingNicknameField,
  ProfileSettingThemeField,
} from '@/components/domain/option/feature/ProfileSettingFields';
import { useProfileSettingForm } from '@/hooks/option/useProfileSettingForm';
import { useAuthStore } from '@/store/authStore';
import { upgradeUserMembership } from '@/lib/api/users';
import { useState } from 'react';

function ProfileSettingForm() {
  const {
    form,
    imageInputRef,
    isBusy,
    isCheckingEmail,
    isReady,
    isSaving,
    profileImageSrc,
    settingsQuery,
    status,
    theme,
    themeOptions,
    handleCancel,
    handleCheckEmail,
    handleEmailChange,
    handleImageChange,
    handleNicknameChange,
    handleOpenImagePicker,
    handleRemoveImage,
    handleSubmit,
    handleThemeChange,
  } = useProfileSettingForm();

  const { user, setUser } = useAuthStore();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      const res = await upgradeUserMembership(user.userId);
      setUser(res.data);
      alert('프리미엄 등급으로 업그레이드되었습니다!');
    } catch (err) {
      alert('업그레이드 중 오류가 발생했습니다.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>프로필 설정</CardTitle>
          <CardDescription>프로필 정보와 이메일을 관리할 수 있습니다.</CardDescription>
        </div>
        {user?.membershipTier === 'FREE' && (
          <Button
            variant="outline"
            className="border-primary text-primary"
            disabled={isUpgrading}
            onClick={handleUpgrade}
          >
            {isUpgrading ? '처리 중...' : '프리미엄 무료 체험(가짜 결제)'}
          </Button>
        )}
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {settingsQuery.isError && (
            <FieldError>{settingsQuery.error?.message ?? '프로필 정보를 불러오지 못했습니다.'}</FieldError>
          )}

          <ProfileSettingImageField
            imageInputRef={imageInputRef}
            isBusy={isBusy}
            isReady={isReady}
            profileImageSrc={profileImageSrc}
            onImageChange={handleImageChange}
            onOpenImagePicker={handleOpenImagePicker}
            onRemoveImage={handleRemoveImage}
          />

          <ProfileSettingNicknameField
            isBusy={isBusy}
            isReady={isReady}
            nickname={form.nickname}
            onChange={handleNicknameChange}
          />

          <ProfileSettingEmailField
            email={form.email}
            isBusy={isBusy}
            isChecking={isCheckingEmail}
            isReady={isReady}
            onChange={handleEmailChange}
            onVerify={handleCheckEmail}
          />

          <ProfileSettingThemeField theme={theme} themeOptions={themeOptions} onChange={handleThemeChange} />

          {status && (
            <p className={status.tone === 'error' ? 'text-sm text-destructive' : 'text-sm text-emerald-600'}>
              {status.message}
            </p>
          )}
        </CardContent>

        <CardFooter className="justify-end gap-3">
          <Button type="button" variant="outline" disabled={isBusy} onClick={handleCancel}>
            취소
          </Button>

          <Button type="submit" disabled={isBusy || !isReady}>
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export { ProfileSettingForm };
