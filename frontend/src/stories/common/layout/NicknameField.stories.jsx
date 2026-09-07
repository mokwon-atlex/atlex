import { useState } from "react"
import { NicknameField } from "@/components/common/layout/NicknameField"

/** @type { import('@storybook/nextjs-vite').Meta<typeof NicknameField> } */
const meta = {
  title: "Common/Layout/NicknameField",
  component: NicknameField,
  tags: ["autodocs"],
}

export default meta

function Controlled({ initialCheckResult, error } = {}) {
  const [value, setValue] = useState("")
  const [checkResult, setCheckResult] = useState(initialCheckResult ?? null)

  function handleCheck() {
    setCheckResult(
      value.length < 2
        ? { ok: false, message: "2자 이상 입력해주세요." }
        : { ok: true, message: "사용 가능한 닉네임입니다." }
    )
  }

  return (
    <div className="w-full">
      <NicknameField
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
    <Controlled initialCheckResult={{ ok: true, message: "사용 가능한 닉네임입니다." }} />
  ),
}

export const CheckDuplicated = {
  render: () => (
    <Controlled initialCheckResult={{ ok: false, message: "이미 사용 중인 닉네임입니다." }} />
  ),
}

export const WithError = {
  render: () => <Controlled error="닉네임을 입력해주세요." />,
}
