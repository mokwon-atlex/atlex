import { expect, userEvent, within } from 'storybook/test';

import { OAuthOnboardingForm } from '@/components/domain/auth/oauth/OAuthOnboardingForm';

/** @type { import('@storybook/nextjs-vite').Meta<typeof OAuthOnboardingForm> } */
const meta = {
  title: 'Domain/Auth/Feature/OAuthOnboardingForm',
  component: OAuthOnboardingForm,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;

export const WithVerifiedEmail = {
  render: (args) => (
    <div className="w-[420px] rounded-3xl border border-border/60 bg-background p-6">
      <OAuthOnboardingForm {...args} />
    </div>
  ),
  args: {
    onboardingToken: 'sample-onboarding-token',
    provider: 'KAKAO',
    initialEmail: 'kakao@example.com',
    suggestedName: '카카오유저',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const idInput = canvas.getByPlaceholderText('아이디를 입력하세요');
    const submitBtn = canvas.getByRole('button', { name: '시작하기' });

    await expect(submitBtn).toBeDisabled();

    await userEvent.type(idInput, 'atlexdev');
    await userEvent.click(canvas.getByRole('checkbox', { name: /전체 약관에 동의합니다/i }));

    await expect(submitBtn).toBeEnabled();
  },
};

export const WithoutEmail = {
  render: (args) => (
    <div className="w-[420px] rounded-3xl border border-border/60 bg-background p-6">
      <OAuthOnboardingForm {...args} />
    </div>
  ),
  args: {
    onboardingToken: 'sample-onboarding-token',
    provider: 'GITHUB',
    initialEmail: '',
    suggestedName: 'octocat',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const emailInput = canvas.getByLabelText('이메일');
    await expect(emailInput).toBeInTheDocument();
  },
};
