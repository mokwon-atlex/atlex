import { useEffect } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import ProfileMenu from '@/components/common/layout/ProfileMenu';
import { useAuthStore } from '@/store/authStore';

const loggedInUser = { userId: 'atlex' };

function ProfileMenuWithAuth({ isLoggedIn }) {
  useEffect(() => {
    useAuthStore.setState({
      isLoggedIn,
      user: isLoggedIn ? loggedInUser : null,
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
  }, [isLoggedIn]);

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
