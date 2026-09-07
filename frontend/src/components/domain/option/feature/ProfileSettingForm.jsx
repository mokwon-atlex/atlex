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

  return (
    <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle>프로필 설정</CardTitle>
        <CardDescription>프로필 정보와 이메일을 관리할 수 있습니다.</CardDescription>
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
