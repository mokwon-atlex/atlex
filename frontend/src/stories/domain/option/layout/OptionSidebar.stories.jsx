import { useState } from "react"
import { OptionSidebar } from "@/components/domain/option/layout/OptionSidebar"

/** @type { import('@storybook/nextjs-vite').Meta<typeof OptionSidebar> } */
const meta = {
  title: "Domain/Option/Layout/OptionSidebar",
  component: OptionSidebar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    activeMenu: {
      control: "select",
      options: ["profile", "password", "notification", "policy", "delete"],
    },
    onChangeMenu: { action: "changeMenu" },
  },
}

export default meta

function SidebarDemo({ initialMenu = "profile" }) {
  const [activeMenu, setActiveMenu] = useState(initialMenu)

  return (
    <div className="w-[260px]">
      <OptionSidebar activeMenu={activeMenu} onChangeMenu={setActiveMenu} />
    </div>
  )
}

export const Default = {
  render: () => <SidebarDemo initialMenu="profile" />,
}

export const PasswordActive = {
  render: () => <SidebarDemo initialMenu="password" />,
}

export const NotificationActive = {
  render: () => <SidebarDemo initialMenu="notification" />,
}

export const DeleteActive = {
  render: () => <SidebarDemo initialMenu="delete" />,
}

export const Controlled = {
  render: (args) => (
    <div className="w-[260px]">
      <OptionSidebar {...args} />
    </div>
  ),
  args: {
    activeMenu: "profile",
  },
}
