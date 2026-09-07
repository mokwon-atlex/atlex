import { LoginForm } from "@/components/domain/auth/login/feature/LoginForm"

/** @type { import('@storybook/nextjs-vite').Meta<typeof LoginForm> } */
const meta = {
  title: "Domain/Auth/Feature/LoginForm",
  component: LoginForm,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    onSwitchMode: { action: "switchMode" },
  },
}

export default meta

export const Default = {
  render: (args) => (
    <div className="w-[380px] rounded-3xl border border-border/60 bg-background p-6">
      <LoginForm {...args} />
    </div>
  ),
  args: {
    onSwitchMode: undefined,
  },
}

export const WithSwitchAction = {
  render: (args) => (
    <div className="w-[380px] rounded-3xl border border-border/60 bg-background p-6">
      <LoginForm {...args} />
    </div>
  ),
  args: {},
}
