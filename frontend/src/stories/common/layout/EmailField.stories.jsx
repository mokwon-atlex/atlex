import { useState } from "react"
import { EmailField } from "@/components/common/layout/EmailField"

/** @type { import('@storybook/nextjs-vite').Meta<typeof EmailField> } */
const meta = {
  title: "Common/Layout/EmailField",
  component: EmailField,
  tags: ["autodocs"],
}

export default meta

function Controlled({ initialDomain = "", ...props }) {
  const [localValue, setLocalValue] = useState("")
  const [domainValue, setDomainValue] = useState(initialDomain)
  const [selectedDomain, setSelectedDomain] = useState(initialDomain)

  return (
    <div className="w-full">
      <EmailField
        localValue={localValue}
        domainValue={domainValue}
        onLocalChange={(e) => setLocalValue(e.target.value)}
        onDomainChange={(e) => setDomainValue(e.target.value)}
        selectedDomain={selectedDomain}
        onSelectedDomainChange={setSelectedDomain}
        {...props}
      />
    </div>
  )
}

export const Default = {
  render: () => <Controlled />,
}

export const WithError = {
  render: () => <Controlled error="올바른 이메일 형식을 입력해주세요." />,
}

export const PreselectedDomain = {
  render: () => <Controlled initialDomain="gmail.com" />,
}

export const DirectInput = {
  render: () => <Controlled initialDomain="" />,
}
