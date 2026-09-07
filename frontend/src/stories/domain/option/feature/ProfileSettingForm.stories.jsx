import { ProfileSettingForm } from "@/components/domain/option/feature/ProfileSettingForm"

/** @type { import('@storybook/nextjs-vite').Meta<typeof ProfileSettingForm> } */
const meta = {
  title: "Domain/Option/Feature/ProfileSettingForm",
  component: ProfileSettingForm,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
}

export default meta

export const Default = {
  render: () => (
    <div className="w-[480px]">
      <ProfileSettingForm />
    </div>
  ),
}
