import { PolicySettingForm } from "@/components/domain/option/feature/PolicySettingForm"

/** @type { import('@storybook/nextjs-vite').Meta<typeof PolicySettingForm> } */
const meta = {
  title: "Domain/Option/Feature/PolicySettingForm",
  component: PolicySettingForm,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
}

export default meta

export const Default = {
  render: () => (
    <div className="w-[480px]">
      <PolicySettingForm />
    </div>
  ),
}
