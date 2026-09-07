import { useState } from "react"
import { UserIdField } from "@/components/common/layout/UserIdField"

/** @type { import('@storybook/nextjs-vite').Meta<typeof UserIdField> } */
const meta = {
  title: "Common/Layout/UserIdField",
  component: UserIdField,
  tags: ["autodocs"],
}

export default meta

function Controlled({ initialCheckResult, error } = {}) {
  const [value, setValue] = useState("")
  const [checkResult, setCheckResult] = useState(initialCheckResult ?? null)

  function handleCheck() {
    setCheckResult(
      value.length < 4
        ? { ok: false, message: "4자 이상 입력해주세요." }
        : { ok: true, message: "사용 가능한 아이디입니다." }
    )
  }

  return (
    <div className="w-full">
      <UserIdField
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onCheckDuplicate={handleCheck}
        checkResult={checkResult}
        error={error}
      />
    </div>
  )
}

export const Default = {
  render: () => <Controlled />,
}

export const CheckAvailable = {
  render: () => (
    <Controlled initialCheckResult={{ ok: true, message: "사용 가능한 아이디입니다." }} />
  ),
}

export const CheckDuplicated = {
  render: () => (
    <Controlled initialCheckResult={{ ok: false, message: "이미 사용 중인 아이디입니다." }} />
  ),
}

export const WithError = {
  render: () => <Controlled error="아이디를 입력해주세요." />,
}
