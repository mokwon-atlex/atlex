import { useEffect } from 'react';
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';

import { DeleteAccountForm } from '@/components/domain/option/feature/DeleteAccountForm';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';

/** 탈퇴 API 호출을 가로채는 spy. 스토리 종료 시 원복한다. */
let deleteSpy;

/** 로그인 상태를 고정해 탈퇴 폼을 렌더링한다. */
function DeleteAccountFormWithAuth() {
  useEffect(() => {
    useAuthStore.setState({ isLoggedIn: true, user: { userId: 'atlex' }, accessToken: 'mock-token' });
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

/** 탈퇴 요청이 실패하면 다이얼로그에 오류를 보여주고 로그인 상태를 유지한다. */
export const ShowsErrorOnFailure = {
  render: () => <DeleteAccountFormWithAuth />,
  beforeEach: () => {
    deleteSpy = spyOn(apiClient, 'delete').mockRejectedValue(new Error('회원 탈퇴에 실패했습니다.'));
    return () => deleteSpy.mockRestore();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: '회원 탈퇴' }));
    await userEvent.click(await screen.findByRole('button', { name: '탈퇴하기' }));

    await waitFor(() => expect(deleteSpy).toHaveBeenCalledWith('/users/atlex'));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('회원 탈퇴에 실패했습니다.'));
    expect(useAuthStore.getState().isLoggedIn).toBe(true);
  },
};
