import { Button } from '@/components/common/ui/button';
import { Field, FieldLabel } from '@/components/common/ui/field';
import { Image } from '@/components/common/ui/image';
import { Input } from '@/components/common/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/common/ui/toggle-group';

function ProfileSettingImageField({
  imageInputRef,
  isBusy,
  isReady,
  profileImageSrc,
  onImageChange,
  onOpenImagePicker,
  onRemoveImage,
}) {
  const imageIcon = profileImageSrc ? (
    <img alt="프로필 이미지" className="h-full w-full object-cover" src={profileImageSrc} />
  ) : undefined;

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
      <Image shape="circle" size="default" icon={imageIcon} className="overflow-hidden" />

      <div className="flex gap-3">
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />

        <Button type="button" variant="outline" disabled={isBusy || !isReady} onClick={onOpenImagePicker}>
          이미지 변경
        </Button>

        <Button type="button" variant="ghost" disabled={isBusy || !isReady || !profileImageSrc} onClick={onRemoveImage}>
          제거
        </Button>
      </div>
    </div>
  );
}

function ProfileSettingNicknameField({ isBusy, isReady, nickname, onChange }) {
  return (
    <Field>
      <FieldLabel>닉네임</FieldLabel>

      <Input
        variant="outline"
        size="lg"
        placeholder="닉네임을 입력해 주세요"
        value={nickname}
        disabled={isBusy || !isReady}
        className="h-11 rounded-xl"
        onChange={onChange}
      />
    </Field>
  );
}

function ProfileSettingEmailField({ email, isBusy, isReady, isChecking, onChange, onVerify }) {
  return (
    <Field>
      <FieldLabel>이메일</FieldLabel>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          variant="outline"
          size="lg"
          placeholder="이메일을 입력해 주세요"
          value={email}
          disabled={isBusy || !isReady}
          className="h-11 rounded-xl"
          onChange={onChange}
        />

        <Button
          type="button"
          variant="secondary"
          className="h-11 rounded-xl px-5"
          disabled={isBusy || !isReady || !email.trim()}
          onClick={onVerify}
        >
          {isChecking ? '확인 중...' : '인증하기'}
        </Button>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">이메일 변경 시 인증 메일이 발송됩니다.</p>
    </Field>
  );
}

function ProfileSettingThemeField({ theme, themeOptions, onChange }) {
  return (
    <Field>
      <FieldLabel>테마</FieldLabel>

      <ToggleGroup
        value={[theme]}
        onValueChange={onChange}
        spacing={0}
        variant="outline"
        className="w-full rounded-xl [&>*]:flex-1 [&>*]:rounded-none [&>*]:first:rounded-l-xl [&>*]:last:rounded-r-xl"
      >
        {themeOptions.map(({ value, label }) => (
          <ToggleGroupItem key={value} value={value} className="h-11 text-sm">
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Field>
  );
}

export { ProfileSettingEmailField, ProfileSettingImageField, ProfileSettingNicknameField, ProfileSettingThemeField };
