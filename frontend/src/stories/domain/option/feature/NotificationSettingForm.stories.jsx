import { NotificationSettingForm } from "@/components/domain/option/feature/NotificationSettingForm"

/** @type { import('@storybook/nextjs-vite').Meta<typeof NotificationSettingForm> } */
const meta = {
  title: "Domain/Option/Feature/NotificationSettingForm",
  component: NotificationSettingForm,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
}

export default meta

export const Default = {
  render: () => (
    <div className="w-[480px]">
      <NotificationSettingForm />
    </div>
  ),
}
