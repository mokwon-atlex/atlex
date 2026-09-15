'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/common/ui/button';
import { Checkbox } from '@/components/common/ui/checkbox';
import { FieldGroup } from '@/components/common/ui/field';
import { UserIdField } from '@/components/common/layout/UserIdField';
import { PasswordField } from '@/components/common/layout/PasswordField';

import { useLogin } from '@/hooks/queries/auth/useLogin';

/** 아이디 저장을 위한 로컬 스토리지 키 */
const SAVED_USER_ID_KEY = 'atlex_saved_user_id';

/**
 * 저장된 아이디를 로컬 스토리지에서 안전하게 조회합니다.
 *
 * @returns {string} 저장된 아이디 또는 빈 문자열
 */
function getSavedUserId() {
  try {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(SAVED_USER_ID_KEY) ?? '';
  } catch {
    return '';
  }
}

/**
 * 아이디를 로컬 스토리지에 안전하게 저장합니다.
 *
 * @param {string} id - 저장할 사용자 아이디
 */
function saveUserId(id) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SAVED_USER_ID_KEY, id);
    }
  } catch {}
}

/**
 * 저장된 아이디를 로컬 스토리지에서 안전하게 제거합니다.
 */
function removeSavedUserId() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SAVED_USER_ID_KEY);
    }
  } catch {}
}

/**
 * 로그인 화면의 폼 컴포넌트입니다.
 * 아이디와 비밀번호를 입력받아 로그인을 수행하며, 아이디 저장 선택 시 로컬 스토리지에 아이디를 보관합니다.
 *
 * @param {Object} props
 * @param {() => void} [props.onSwitchMode] - 회원가입 모드로 전환하는 콜백
 */
function LoginForm({ onSwitchMode }) {
  const router = useRouter();
  const { mutateAsync: login, isPending } = useLogin();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberId, setRememberId] = useState(false);
  const [error, setError] = useState('');

  // 화면 마운트 시 로컬 스토리지에 저장된 아이디가 있으면 복원
  useEffect(() => {
    const savedId = getSavedUserId();
    if (savedId) {
      setUserId(savedId);
      setRememberId(true);
    }
  }, []);

  /**
   * 아이디 저장 체크박스 변경 시 호출되는 핸들러입니다.
   * 체크 해제 시 저장되어 있던 아이디를 로컬 스토리지에서 즉시 제거합니다.
   *
   * @param {boolean} checked - 체크 여부
   */
  function handleRememberIdChange(checked) {
    const nextChecked = checked === true;
    setRememberId(nextChecked);
    if (!nextChecked) {
      removeSavedUserId();
    }
  }

  /**
   * 로그인 폼 제출 이벤트 핸들러입니다.
   * 로그인 성공 시 아이디 저장 선택 여부에 따라 스토리지에 아이디만 보관하거나 제거합니다.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - 폼 제출 이벤트
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login({ userId, password });
      // 아이디 저장이 선택된 경우 아이디만 저장하고, 미선택 시 저장값 제거
      if (rememberId) {
        saveUserId(userId.trim());
      } else {
        removeSavedUserId();
      }
      router.push('/');
    } catch (err) {
      setError(err.message ?? '로그인에 실패했습니다.');
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

          <div className="flex items-center gap-2 text-sm">
            <button type="button" className="font-semibold text-primary hover:underline">
              아이디 찾기
            </button>

            <span className="text-muted-foreground">|</span>

            <button type="button" className="font-semibold text-primary hover:underline">
              비밀번호 초기화
            </button>
          </div>
        </div>

        <Button type="submit" disabled={isPending} className="h-10 w-full rounded-lg text-sm font-bold">
          {isPending ? '로그인 중...' : '로그인'}
        </Button>

        <p className="border-t border-border/60 pt-5 text-center text-sm text-muted-foreground">
          아직 계정이 없으신가요?{' '}
          <button type="button" onClick={onSwitchMode} className="font-semibold text-primary hover:underline">
            회원가입
          </button>
        </p>
      </FieldGroup>
    </form>
  );
}

export { LoginForm, SAVED_USER_ID_KEY };
