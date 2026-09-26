import { useEffect } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import ProfileMenu from '@/components/common/layout/ProfileMenu';
import { useAuthStore } from '@/store/authStore';

const loggedInUser = { userId: 'atlex', role: 'USER' };
const adminUser = { userId: 'atlex', role: 'ADMIN' };

function ProfileMenuWithAuth({ isLoggedIn, isAdmin = false }) {
  useEffect(() => {
    useAuthStore.setState({
      isLoggedIn,
      user: isLoggedIn ? (isAdmin ? adminUser : loggedInUser) : null,
      accessToken: null,
      refreshToken: null,
    });

    return () => {
      useAuthStore.setState({
        isLoggedIn: false,
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    };
  }, [isLoggedIn, isAdmin]);

  return (
    <div className="flex min-h-48 min-w-72 justify-end p-8">
      <ProfileMenu />
    </div>
  );
}

/** @type { import('@storybook/nextjs-vite').Meta<typeof ProfileMenuWithAuth> } */
const meta = {
  title: 'Common/Layout/ProfileMenu',
  component: ProfileMenuWithAuth,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;

async function openProfileMenu(canvasElement) {
  const canvas = within(canvasElement);

  await userEvent.click(canvas.getByRole('button', { name: '프로필' }));
  return within(canvasElement.ownerDocument.body);
}

export const LoggedIn = {
  args: { isLoggedIn: true },
  play: async ({ canvasElement }) => {
    const screen = await openProfileMenu(canvasElement);

    await waitFor(() => expect(screen.getByRole('link', { name: '내 블로그' })).toHaveAttribute('href', '/@atlex'));
    await expect(screen.getByRole('link', { name: '그래프 뷰' })).toHaveAttribute('href', '/graph');
    // 일반 사용자에게는 관리자 메뉴를 노출하지 않는다.
    await expect(screen.queryByRole('link', { name: '신고 관리' })).toBeNull();
  },
};

export const LoggedInAdmin = {
  args: { isLoggedIn: true, isAdmin: true },
  play: async ({ canvasElement }) => {
    const screen = await openProfileMenu(canvasElement);

    await waitFor(() =>
      expect(screen.getByRole('link', { name: '신고 관리' })).toHaveAttribute('href', '/admin/reports'),
    );
  },
};

export const LoggedOut = {
  args: { isLoggedIn: false },
  play: async ({ canvasElement }) => {
    const screen = await openProfileMenu(canvasElement);

    await waitFor(() => expect(screen.getByRole('link', { name: '로그인 / 회원가입' })).toBeVisible());
    await expect(screen.getByRole('link', { name: '그래프 뷰' })).toHaveAttribute('href', '/graph');
  },
};
