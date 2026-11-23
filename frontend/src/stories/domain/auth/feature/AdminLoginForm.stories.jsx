import { expect, spyOn, userEvent, within } from 'storybook/test';

import { apiClient } from '@/lib/api/client';
import { AdminLoginForm, SAVED_ADMIN_ID_KEY } from '@/components/domain/auth/login/feature/AdminLoginForm';
import { useAuthStore } from '@/store/authStore';

/** @type { import('@storybook/nextjs-vite').Meta<typeof AdminLoginForm> } */
const meta = {
  title: 'Domain/Auth/Feature/AdminLoginForm',
  component: AdminLoginForm,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;

export const Default = {
  render: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SAVED_ADMIN_ID_KEY);
    }
    return (
      <div className="w-[380px] rounded-3xl border border-border/60 bg-background p-6">
        <AdminLoginForm />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const idInput = canvas.getByPlaceholderText('아이디를 입력하세요');
    const checkbox = canvas.getByRole('checkbox', { name: /아이디 저장/i });

    await expect(idInput).toHaveValue('');
    await expect(checkbox).not.toBeChecked();
  },
};

export const WithSavedIdRestored = {
  render: () => {
    window.localStorage.setItem(SAVED_ADMIN_ID_KEY, 'adminUser123');
    return (
      <div className="w-[380px] rounded-3xl border border-border/60 bg-background p-6">
        <AdminLoginForm />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const idInput = canvas.getByPlaceholderText('아이디를 입력하세요');
    const checkbox = canvas.getByRole('checkbox', { name: /아이디 저장/i });

    await expect(idInput).toHaveValue('adminUser123');
    await expect(checkbox).toBeChecked();
  },
};

export const PasswordAndAuthTokensNotSaved = {
  render: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
    return (
      <div className="w-[380px] rounded-3xl border border-border/60 bg-background p-6">
        <AdminLoginForm />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const postSpy = spyOn(apiClient, 'post').mockImplementation(async (url) => {
      if (url === '/auth/admin/login') {
        return {
          userId: 'adminRoot',
          role: 'ADMIN',
          accessToken: 'dummy-access-token',
          refreshToken: 'dummy-refresh-token',
        };
      }
      return {};
    });

    try {
      const canvas = within(canvasElement);
      const idInput = canvas.getByPlaceholderText('아이디를 입력하세요');
      const passwordInput = canvas.getByPlaceholderText('비밀번호 입력');
      const checkbox = canvas.getByRole('checkbox', { name: /아이디 저장/i });
      const submitButton = canvas.getByRole('button', { name: '관리자 로그인' });

      await userEvent.type(idInput, 'adminRoot');
      await userEvent.type(passwordInput, 'SuperSecret123!');
      await userEvent.click(checkbox);
      await userEvent.click(submitButton);

      await expect(window.localStorage.getItem(SAVED_ADMIN_ID_KEY)).toBe('adminRoot');
      const storageKeys = Object.keys(window.localStorage);
      await expect(storageKeys.some((k) => k.toLowerCase().includes('password'))).toBe(false);
      await expect(storageKeys.some((k) => k.toLowerCase().includes('token'))).toBe(false);
    } finally {
      postSpy.mockRestore();
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
      }
    }
  },
};
