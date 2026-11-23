import { AuthCard } from '@/components/domain/auth/AuthCard';

/** @type { import('@storybook/nextjs-vite').Meta<typeof AuthCard> } */
const meta = {
  title: 'Domain/Auth/AuthCard',
  component: AuthCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;

export const Login = {
  render: () => (
    <div className="w-[420px]">
      <AuthCard />
    </div>
  ),
};
