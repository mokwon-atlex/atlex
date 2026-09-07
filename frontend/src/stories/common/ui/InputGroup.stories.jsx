import { Search, Eye } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/common/ui/input-group"

/** @type { import('@storybook/nextjs-vite').Meta<typeof InputGroup> } */
const meta = {
  title: "Common/UI/InputGroup",
  component: InputGroup,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "outline", "filled", "ghost"] },
  },
}

export default meta

export const Default = {
  render: () => (
    <InputGroup className="w-72">
      <InputGroupAddon align="inline-start">
        <InputGroupText><Search /></InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="검색어를 입력하세요" />
    </InputGroup>
  ),
}

export const Outline = {
  render: () => (
    <InputGroup variant="outline" className="w-72">
      <InputGroupAddon align="inline-start">
        <InputGroupText><Search /></InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="검색어를 입력하세요" />
    </InputGroup>
  ),
}

export const Filled = {
  render: () => (
    <InputGroup variant="filled" className="w-72">
      <InputGroupAddon align="inline-start">
        <InputGroupText><Search /></InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="검색어를 입력하세요" />
    </InputGroup>
  ),
}

export const Ghost = {
  render: () => (
    <InputGroup variant="ghost" className="w-72">
      <InputGroupAddon align="inline-start">
        <InputGroupText><Search /></InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="검색어를 입력하세요" />
    </InputGroup>
  ),
}

export const AllVariants = {
  render: () => (
    <div className="flex flex-col gap-3 w-72">
      {["default", "outline", "filled", "ghost"].map((variant) => (
        <div key={variant} className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{variant}</span>
          <InputGroup variant={variant}>
            <InputGroupAddon align="inline-start">
              <InputGroupText><Search /></InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder="검색어를 입력하세요" />
          </InputGroup>
        </div>
      ))}
    </div>
  ),
}

export const WithTrailingButton = {
  render: () => (
    <InputGroup variant="outline" className="w-72">
      <InputGroupInput type="password" placeholder="비밀번호를 입력하세요" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton><Eye /></InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const WithTextarea = {
  render: () => (
    <InputGroup variant="outline" className="w-72">
      <InputGroupAddon align="block-start">
        <InputGroupText>메모</InputGroupText>
      </InputGroupAddon>
      <InputGroupTextarea placeholder="내용을 입력하세요" />
    </InputGroup>
  ),
}

export const Disabled = {
  render: () => (
    <InputGroup variant="outline" className="w-72" data-disabled="true">
      <InputGroupAddon align="inline-start">
        <InputGroupText><Search /></InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="비활성화 상태" disabled />
    </InputGroup>
  ),
}
