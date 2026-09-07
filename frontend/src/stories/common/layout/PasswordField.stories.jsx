import { useState } from "react"
import { PasswordField } from "@/components/common/layout/PasswordField"

/** @type { import('@storybook/nextjs-vite').Meta<typeof PasswordField> } */
const meta = {
  title: "Common/Layout/PasswordField",
  component: PasswordField,
  tags: ["autodocs"],
}

export default meta

function validate(password) {
  return {
    length: password.length >= 10,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  }
}

function Controlled(props) {
  const [value, setValue] = useState("")
  const [confirmValue, setConfirmValue] = useState("")
  const checks = validate(value)

  return (
    <div className="w-full">
      <PasswordField
        value={value}
        onChange={(e) => setValue(e.target.value)}
        confirmValue={confirmValue}
        onConfirmChange={(e) => setConfirmValue(e.target.value)}
        checks={checks}
        {...props}
      />
    </div>
  )
}

export const Default = {
  render: () => <Controlled />,
}

export const WithError = {
  render: () => <Controlled error="비밀번호를 입력해주세요." />,
}

export const AllChecksPassed = {
  render: () => {
    function AllPassed() {
      const password = "Abcdefg123!"
      const [confirmValue, setConfirmValue] = useState("")

      return (
        <div className="w-80">
          <PasswordField
            value={password}
            onChange={() => {}}
            confirmValue={confirmValue}
            onConfirmChange={(e) => setConfirmValue(e.target.value)}
            checks={validate(password)}
          />
        </div>
      )
    }

    return <AllPassed />
  },
}

export const WithoutChecks = {
  render: () => {
    function NoChecks() {
      const [value, setValue] = useState("")
      const [confirmValue, setConfirmValue] = useState("")

      return (
        <div className="w-80">
          <PasswordField
            value={value}
            onChange={(e) => setValue(e.target.value)}
            confirmValue={confirmValue}
            onConfirmChange={(e) => setConfirmValue(e.target.value)}
          />
        </div>
      )
    }

    return <NoChecks />
  },
}
