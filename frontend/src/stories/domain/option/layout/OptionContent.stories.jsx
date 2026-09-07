import { OptionContent } from "@/components/domain/option/layout/OptionContent"

/** @type { import('@storybook/nextjs-vite').Meta<typeof OptionContent> } */
const meta = {
  title: "Domain/Option/Layout/OptionContent",
  component: OptionContent,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    activeMenu: {
      control: "select",
      options: ["profile", "password", "notification", "policy", "delete"],
    },
  },
}

export default meta

export const Profile = {
  render: (args) => (
    <div className="w-[480px]">
      <OptionContent {...args} />
    </div>
  ),
  args: {
    activeMenu: "profile",
  },
}

export const Password = {
  render: (args) => (
    <div className="w-[480px]">
      <OptionContent {...args} />
    </div>
  ),
  args: {
    activeMenu: "password",
  },
}

export const Notification = {
  render: (args) => (
    <div className="w-[480px]">
      <OptionContent {...args} />
    </div>
  ),
  args: {
    activeMenu: "notification",
  },
}

export const Policy = {
  render: (args) => (
    <div className="w-[480px]">
      <OptionContent {...args} />
    </div>
  ),
  args: {
    activeMenu: "policy",
  },
}

export const DeleteAccount = {
  render: (args) => (
    <div className="w-[480px]">
      <OptionContent {...args} />
    </div>
  ),
  args: {
    activeMenu: "delete",
  },
}
