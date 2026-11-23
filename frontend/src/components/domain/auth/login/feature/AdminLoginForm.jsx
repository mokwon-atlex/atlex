'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/common/ui/button';
import { Checkbox } from '@/components/common/ui/checkbox';
import { FieldGroup } from '@/components/common/ui/field';
import { UserIdField } from '@/components/common/layout/UserIdField';
import { PasswordField } from '@/components/common/layout/PasswordField';
import { useAdminLogin } from '@/hooks/queries/auth/useAdminLogin';

/** 관리자 아이디 저장을 위한 로컬 스토리지 키 */
const SAVED_ADMIN_ID_KEY = 'atlex_saved_admin_id';

function getSavedAdminId() {
  try {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(SAVED_ADMIN_ID_KEY) ?? '';
  } catch {
    return '';
  }
}

function saveAdminId(id) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SAVED_ADMIN_ID_KEY, id);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function removeSavedAdminId() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SAVED_ADMIN_ID_KEY);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * 관리자 전용 로그인 폼 컴포넌트입니다.
 * 일반 사용자 OAuth2 화면(/account)과 분리된 /admin/login 경로에서만 사용됩니다.
 */
function AdminLoginForm() {
  const router = useRouter();
  const { mutateAsync: adminLogin, isPending } = useAdminLogin();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberId, setRememberId] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedId = getSavedAdminId();
    if (savedId) {
      setUserId(savedId);
      setRememberId(true);
    }
  }, []);

  function handleRememberIdChange(checked) {
    const nextChecked = checked === true;
    setRememberId(nextChecked);
    if (!nextChecked) {
      removeSavedAdminId();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await adminLogin({ userId, password });
      if (rememberId) {
        saveAdminId(userId.trim());
      } else {
        removeSavedAdminId();
      }
      router.replace('/admin/reports');
    } catch (err) {
      setError(err?.message ?? '관리자 로그인에 실패했습니다.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <FieldGroup className="gap-5">
        <UserIdField value={userId} onChange={(e) => setUserId(e.target.value)} showCheckButton={false} />

        <PasswordField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showConfirm={false}
          showChecks={false}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <Checkbox checked={rememberId} onCheckedChange={handleRememberIdChange} />
            아이디 저장
          </label>
        </div>

        <Button type="submit" disabled={isPending} className="h-10 w-full rounded-lg text-sm font-bold">
          {isPending ? '로그인 중...' : '관리자 로그인'}
        </Button>
      </FieldGroup>
    </form>
  );
}

export { AdminLoginForm, SAVED_ADMIN_ID_KEY };
