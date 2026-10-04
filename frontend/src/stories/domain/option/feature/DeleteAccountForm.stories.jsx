import { useEffect } from 'react';
import { AxiosError } from 'axios';
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';

import { DeleteAccountForm } from '@/components/domain/option/feature/DeleteAccountForm';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';

/** 탈퇴 API 호출을 가로채는 spy. 스토리 종료 시 원복한다. */
let deleteSpy;

/** 로그인 상태를 고정해 탈퇴 폼을 렌더링한다. 스토리가 끝나면 이전 인증 상태로 되돌린다. */
function DeleteAccountFormWithAuth() {
  useEffect(() => {
    const { isLoggedIn, user, accessToken } = useAuthStore.getState();
    useAuthStore.setState({ isLoggedIn: true, user: { userId: 'atlex' }, accessToken: 'mock-token' });
    return () => useAuthStore.setState({ isLoggedIn, user, accessToken });
  }, []);

  return (
    <div className="w-[480px]">
      <DeleteAccountForm />
    </div>
  );
}

/** @type { import('@storybook/nextjs-vite').Meta<typeof DeleteAccountForm> } */
const meta = {
  title: 'Domain/Option/Feature/DeleteAccountForm',
  component: DeleteAccountForm,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;

export const Default = {
  render: () => (
    <div className="w-[480px]">
      <DeleteAccountForm />
    </div>
  ),
};

/** 취소하면 요청 없이 다이얼로그만 닫힌다. */
export const CancelDoesNotDelete = {
  render: () => <DeleteAccountFormWithAuth />,
  beforeEach: () => {
    deleteSpy = spyOn(apiClient, 'delete').mockResolvedValue(undefined);
    return () => deleteSpy.mockRestore();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: '회원 탈퇴' }));
    await userEvent.click(await screen.findByRole('button', { name: '취소' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(useAuthStore.getState().isLoggedIn).toBe(true);
  },
};

/** 탈퇴 요청이 도메인 오류로 실패하면 서버 안내를 보여주고 로그인 상태를 유지한다. */
export const ShowsErrorOnFailure = {
  render: () => <DeleteAccountFormWithAuth />,
  beforeEach: () => {
    const domainError = Object.assign(new Error('본인 계정만 탈퇴할 수 있습니다.'), { code: 'FORBIDDEN', status: 403 });
    deleteSpy = spyOn(apiClient, 'delete').mockRejectedValue(domainError);
    return () => deleteSpy.mockRestore();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: '회원 탈퇴' }));
    await userEvent.click(await screen.findByRole('button', { name: '탈퇴하기' }));

    await waitFor(() => expect(deleteSpy).toHaveBeenCalledWith('/users/atlex'));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('본인 계정만 탈퇴할 수 있습니다.'));
    expect(useAuthStore.getState().isLoggedIn).toBe(true);
  },
};

/** 네트워크 오류처럼 도메인 오류가 아니면 기술 메시지 대신 일반 안내를 보여준다. */
export const HidesTechnicalErrorMessage = {
  render: () => <DeleteAccountFormWithAuth />,
  beforeEach: () => {
    deleteSpy = spyOn(apiClient, 'delete').mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK'));
    return () => deleteSpy.mockRestore();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: '회원 탈퇴' }));
    await userEvent.click(await screen.findByRole('button', { name: '탈퇴하기' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해 주세요.'),
    );
    expect(screen.getByRole('alert')).not.toHaveTextContent('Network Error');
  },
};
