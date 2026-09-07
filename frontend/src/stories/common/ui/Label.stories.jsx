import { Label } from "@/components/common/ui/label"

/** @type { import('@storybook/nextjs-vite').Meta<typeof Label> } */
const meta = {
  title: "Common/UI/Label",
  component: Label,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "muted"] },
    size: { control: "select", options: ["sm", "default", "lg"] },
    children: { control: "text" },
  },
}

export default meta

export const Default = { args: { children: "이메일 주소" } }

export const Muted = { args: { variant: "muted", children: "선택 항목" } }

export const Sizes = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label size="sm">Small 레이블</Label>
      <Label size="default">Default 레이블</Label>
      <Label size="lg">Large 레이블</Label>
    </div>
  ),
}

export const AllVariants = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label variant="default">Default</Label>
      <Label variant="muted">Muted</Label>
    </div>
  ),
}

export const WithInput = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="email">이메일 주소</Label>
      <input
        id="email"
        type="email"
        placeholder="example@email.com"
        className="h-8 rounded-lg border-2 border-border px-2.5 text-sm outline-none"
      />
    </div>
  ),
}

export const Disabled = {
  render: () => (
    <div className="group flex flex-col gap-1.5" data-disabled="true">
      <Label>비활성화 레이블</Label>
    </div>
  ),
}
