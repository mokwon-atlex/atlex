import { PasswordSettingForm } from "@/components/domain/option/feature/PasswordSettingForm"

/** @type { import('@storybook/nextjs-vite').Meta<typeof PasswordSettingForm> } */
const meta = {
  title: "Domain/Option/Feature/PasswordSettingForm",
  component: PasswordSettingForm,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
}

export default meta

export const Default = {
  render: () => (
    <div className="w-[480px]">
      <PasswordSettingForm />
    </div>
  ),
}
