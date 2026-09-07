import { TermsStep } from "@/components/domain/auth/terms/TermsStep"

/** @type { import('@storybook/nextjs-vite').Meta<typeof TermsStep> } */
const meta = {
  title: "Domain/Auth/Feature/TermsStep",
  component: TermsStep,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    onNext: { action: "next" },
    onBack: { action: "back" },
  },
}

export default meta

export const Default = {
  render: (args) => (
    <div className="w-[420px] rounded-3xl border border-border/60 bg-background p-6">
      <TermsStep {...args} />
    </div>
  ),
  args: {},
}

export const InCard = {
  render: (args) => (
    <div className="w-[420px] rounded-3xl border border-border/60 bg-background p-6 shadow-sm">
      <h2 className="mb-1 text-2xl font-black tracking-tight">약관 동의</h2>
      <p className="mb-4 text-sm text-muted-foreground">서비스 이용을 위해 아래 약관을 확인해 주세요.</p>
      <TermsStep {...args} />
    </div>
  ),
  args: {},
}
