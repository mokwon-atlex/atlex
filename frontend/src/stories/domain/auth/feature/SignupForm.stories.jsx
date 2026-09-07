import { SignupForm } from "@/components/domain/auth/signup/feature/SignupForm"

/** @type { import('@storybook/nextjs-vite').Meta<typeof SignupForm> } */
const meta = {
  title: "Domain/Auth/Feature/SignupForm",
  component: SignupForm,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    onBack: { action: "back" },
    onLogin: { action: "login" },
  },
}

export default meta

export const Default = {
  render: (args) => (
    <div className="w-[420px] rounded-3xl border border-border/60 bg-background p-6">
      <SignupForm {...args} />
    </div>
  ),
  args: {},
}

export const Scrollable = {
  render: (args) => (
    <div className="w-[420px] max-h-[600px] overflow-y-auto rounded-3xl border border-border/60 bg-background p-6">
      <SignupForm {...args} />
    </div>
  ),
  args: {},
}
