import { expect, within } from 'storybook/test';

import { LoginForm } from '@/components/domain/auth/login/feature/LoginForm';

/** @type { import('@storybook/nextjs-vite').Meta<typeof LoginForm> } */
const meta = {
  title: 'Domain/Auth/Feature/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;

export const Default = {
  render: () => (
    <div className="w-[380px] rounded-3xl border border-border/60 bg-background p-6">
      <LoginForm />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: /GitHub로 계속하기/i })).toHaveAttribute(
      'href',
      '/oauth2/authorization/github',
    );
    await expect(canvas.getByRole('link', { name: /Google로 계속하기/i })).toHaveAttribute(
      'href',
      '/oauth2/authorization/google',
    );
    await expect(canvas.getByRole('link', { name: /Kakao로 계속하기/i })).toHaveAttribute(
      'href',
      '/oauth2/authorization/kakao',
    );
  },
};
