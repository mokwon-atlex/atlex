import { useState } from "react"
import { AuthCard } from "@/components/domain/auth/AuthCard"

/** @type { import('@storybook/nextjs-vite').Meta<typeof AuthCard> } */
const meta = {
  title: "Domain/Auth/AuthCard",
  component: AuthCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    mode: {
      control: "select",
      options: ["login", "terms", "signup"],
      description: "현재 표시할 인증 모드",
    },
    onModeChange: { action: "modeChanged" },
  },
}

export default meta

function Controlled({ initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode)
  return (
    <div className="w-[420px]">
      <AuthCard mode={mode} onModeChange={setMode} />
    </div>
  )
}

export const Login = {
  render: () => <Controlled initialMode="login" />,
}

export const Terms = {
  render: () => <Controlled initialMode="terms" />,
}

export const Signup = {
  render: () => <Controlled initialMode="signup" />,
}
