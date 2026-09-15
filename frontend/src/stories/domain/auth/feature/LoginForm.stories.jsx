import { expect, userEvent, within } from 'storybook/test';

import { LoginForm, SAVED_USER_ID_KEY } from '@/components/domain/auth/login/feature/LoginForm';

/** @type { import('@storybook/nextjs-vite').Meta<typeof LoginForm> } */
const meta = {
  title: 'Domain/Auth/Feature/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    onSwitchMode: { action: 'switchMode' },
  },
};

export default meta;

export const Default = {
  render: (args) => (
    <div className="w-[380px] rounded-3xl border border-border/60 bg-background p-6">
      <LoginForm {...args} />
    </div>
  ),
  args: {
    onSwitchMode: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const idInput = canvas.getByPlaceholderText('아이디를 입력하세요');
    const checkbox = canvas.getByRole('checkbox', { name: /아이디 저장/i });

    // 초기 상태: 아이디 입력란은 비어 있고 아이디 저장은 미선택 상태여야 함
    await expect(idInput).toHaveValue('');
    await expect(checkbox).not.toBeChecked();
  },
};

export const WithSavedIdRestored = {
  render: (args) => {
    // 마운트 전 로컬 스토리지에 아이디 설정
    window.localStorage.setItem(SAVED_USER_ID_KEY, 'savedUser123');
    return (
      <div className="w-[380px] rounded-3xl border border-border/60 bg-background p-6">
        <LoginForm {...args} />
      </div>
    );
  },
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const idInput = canvas.getByPlaceholderText('아이디를 입력하세요');
    const checkbox = canvas.getByRole('checkbox', { name: /아이디 저장/i });

    // 저장된 아이디 복원 및 체크박스 활성화 검증
    await expect(idInput).toHaveValue('savedUser123');
    await expect(checkbox).toBeChecked();
  },
};

export const UncheckRemovesSavedId = {
  render: (args) => {
    // 마운트 전 로컬 스토리지에 아이디 설정
    window.localStorage.setItem(SAVED_USER_ID_KEY, 'removeTargetUser');
    return (
      <div className="w-[380px] rounded-3xl border border-border/60 bg-background p-6">
        <LoginForm {...args} />
      </div>
    );
  },
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: /아이디 저장/i });

    // 초기 복원 확인
    await expect(checkbox).toBeChecked();
    await expect(window.localStorage.getItem(SAVED_USER_ID_KEY)).toBe('removeTargetUser');

    // 체크 해제 클릭
    await userEvent.click(checkbox);

    // 체크 해제 상태 및 로컬 스토리지에서 즉시 삭제되었는지 검증
    await expect(checkbox).not.toBeChecked();
    await expect(window.localStorage.getItem(SAVED_USER_ID_KEY)).toBeNull();
  },
};

export const PasswordAndAuthTokensNotSaved = {
  render: (args) => {
    window.localStorage.clear();
    return (
      <div className="w-[380px] rounded-3xl border border-border/60 bg-background p-6">
        <LoginForm {...args} />
      </div>
    );
  },
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const idInput = canvas.getByPlaceholderText('아이디를 입력하세요');
    const passwordInput = canvas.getByPlaceholderText('비밀번호 입력');
    const checkbox = canvas.getByRole('checkbox', { name: /아이디 저장/i });

    // 아이디 및 비밀번호 입력
    await userEvent.type(idInput, 'secureUser');
    await userEvent.type(passwordInput, 'SuperSecret123!');

    // 아이디 저장 체크박스 선택
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();

    // 로컬 스토리지에 비밀번호나 인증 정보가 저장되지 않았는지 검증
    const storageKeys = Object.keys(window.localStorage);
    await expect(window.localStorage.getItem('password')).toBeNull();
    await expect(storageKeys.some((k) => k.toLowerCase().includes('password'))).toBe(false);
    await expect(storageKeys.some((k) => k.toLowerCase().includes('token'))).toBe(false);
  },
};
