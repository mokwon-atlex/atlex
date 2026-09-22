import BlogDetailActionRail from '@/components/domain/blog-detail/ui/BlogDetailActionRail';
import { expect, userEvent, within } from 'storybook/test';
import { useAuthStore } from '@/store/authStore';

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogDetailActionRail> } */
const meta = {
  title: 'Domain/BlogDetail/UI/BlogDetailActionRail',
  component: BlogDetailActionRail,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    likes: { control: 'number' },
    bookmarks: { control: 'number' },
    isFavorited: { control: 'boolean' },
    isLoading: { control: 'boolean' },
  },
};

export default meta;

export const Default = {
  args: {
    likes: 18,
    bookmarks: 7,
    isFavorited: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const saveButton = canvas.getByRole('button', { name: /즐겨찾기 저장/i });

    await expect(saveButton).toBeVisible();
    await expect(saveButton).toHaveTextContent('7');
  },
};

export const Favorited = {
  args: {
    likes: 18,
    bookmarks: 8,
    isFavorited: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const saveButton = canvas.getByRole('button', { name: /즐겨찾기 해제/i });

    await expect(saveButton).toBeVisible();
    await expect(saveButton).toHaveTextContent('8');
  },
};

export const Loading = {
  args: {
    likes: 18,
    bookmarks: 7,
    isLoading: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const saveButton = canvas.getByRole('button', { name: /즐겨찾기 저장/i });

    await expect(saveButton).toBeDisabled();
    await expect(canvas.getByTestId('save-loading-spinner')).toBeVisible();
  },
};

export const UnauthenticatedClickShowsAlert = {
  decorators: [
    (Story) => {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('auth-storage');
      }
      return <Story />;
    },
  ],
  args: {
    likes: 18,
    bookmarks: 7,
    postId: 999,
  },
  play: async ({ canvasElement }) => {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('auth-storage');
    }

    const canvas = within(canvasElement);
    const saveButton = canvas.getByRole('button', { name: /즐겨찾기 저장/i });

    await userEvent.click(saveButton);

    const alertMessage = canvas.getByRole('alert');
    await expect(alertMessage).toBeVisible();
    await expect(alertMessage).toHaveTextContent('로그인이 필요합니다.');
  },
};

export const HighEngagement = {
  args: {
    likes: 342,
    bookmarks: 87,
  },
};

export const LowEngagement = {
  args: {
    likes: 1,
    bookmarks: 0,
  },
};
