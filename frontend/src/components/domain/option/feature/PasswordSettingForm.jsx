'use client';

import { useState } from 'react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/common/ui/card';

import { Button } from '@/components/common/ui/button';
import { PasswordField } from '@/components/common/layout/PasswordField';
import { updateUserPassword } from '@/lib/api/users';
import { useAuthStore } from '@/store/authStore';

function isCurrentPasswordError(error, message) {
  const code = String(error?.code ?? '').toLowerCase();
  const text = String(message ?? '').toLowerCase();

  return (
    error?.status === 401 ||
    code.includes('current') ||
    code.includes('old') ||
    text.includes('currentpassword') ||
    text.includes('current password') ||
    text.includes('old password') ||
    text.includes('현재 비밀번호') ||
    text.includes('기존 비밀번호') ||
    text.includes('비밀번호가 일치하지')
  );
}

function PasswordSettingForm() {
  const userId = useAuthStore((state) => state.user?.userId);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const passwordChecks = {
    length: newPassword.length >= 10,
    lower: /[a-z]/.test(newPassword),
    upper: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };

  function clearMessages() {
    setCurrentPasswordError('');
    setNewPasswordError('');
    setNotice('');
  }

  function resetForm() {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    clearMessages();
  }

  async function submitPasswordChange(currentUserId) {
    await updateUserPassword(currentUserId, currentPassword, newPassword);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    clearMessages();

    if (!userId) {
      setCurrentPasswordError('로그인 정보를 확인할 수 없습니다.');
      return;
    }

    if (!currentPassword) {
      setCurrentPasswordError('현재 비밀번호를 입력해 주세요.');
      return;
    }

    if (!newPassword) {
      setNewPasswordError('새 비밀번호를 입력해 주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setNewPasswordError('새 비밀번호와 확인 값이 일치하지 않습니다.');
      return;
    }

    if (Object.values(passwordChecks).some((isValid) => !isValid)) {
      setNewPasswordError('새 비밀번호 조건을 모두 만족해 주세요.');
      return;
    }

    try {
      setIsSaving(true);
      await submitPasswordChange(userId);
      resetForm();
      setNotice('비밀번호를 변경했습니다.');
    } catch (nextError) {
      const nextMessage = nextError.message ?? '비밀번호 변경에 실패했습니다.';

      if (isCurrentPasswordError(nextError, nextMessage)) {
        setCurrentPasswordError(nextMessage);
      } else {
        setNewPasswordError(nextMessage);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle>비밀번호 변경</CardTitle>
        <CardDescription>안전한 계정 관리를 위해 비밀번호를 변경해 주세요.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          <PasswordField
            value={currentPassword}
            onChange={(event) => {
              setCurrentPassword(event.target.value);
              setCurrentPasswordError('');
              setNotice('');
            }}
            error={currentPasswordError}
            showConfirm={false}
            showChecks={false}
            label="현재 비밀번호"
            placeholder="현재 비밀번호 입력"
          />

          <PasswordField
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              setNewPasswordError('');
              setNotice('');
            }}
            confirmValue={confirmPassword}
            onConfirmChange={(event) => {
              setConfirmPassword(event.target.value);
              setNewPasswordError('');
              setNotice('');
            }}
            checks={passwordChecks}
            error={newPasswordError}
            label="새 비밀번호"
            placeholder="새 비밀번호 입력"
            confirmPlaceholder="새 비밀번호 확인"
            successMessage="새 비밀번호가 일치합니다."
          />

          {notice && <p className="text-sm text-emerald-600">{notice}</p>}
        </CardContent>

        <CardFooter className="justify-end gap-3">
          <Button type="button" variant="outline" disabled={isSaving} onClick={resetForm}>
            취소
          </Button>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? '변경 중...' : '변경하기'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export { PasswordSettingForm };
