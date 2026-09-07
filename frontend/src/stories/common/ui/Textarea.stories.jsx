import { Textarea } from "@/components/common/ui/textarea"

/** @type { import('@storybook/nextjs-vite').Meta<typeof Textarea> } */
const meta = {
  title: "Common/UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "outline", "filled", "ghost"] },
    resize: { control: "select", options: ["none", "vertical", "horizontal", "both"] },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
}

export default meta

export const Default = { args: { placeholder: "내용을 입력하세요" } }

export const Outline = { args: { variant: "outline", placeholder: "내용을 입력하세요" } }

export const Filled = { args: { variant: "filled", placeholder: "내용을 입력하세요" } }

export const Ghost = { args: { variant: "ghost", placeholder: "내용을 입력하세요" } }

export const AllVariants = {
  render: () => (
    <div className="flex flex-col gap-3 w-72">
      <Textarea variant="default" placeholder="Default" />
      <Textarea variant="outline" placeholder="Outline" />
      <Textarea variant="filled" placeholder="Filled" />
      <Textarea variant="ghost" placeholder="Ghost" />
    </div>
  ),
}

export const ResizeOptions = {
  render: () => (
    <div className="flex flex-col gap-3 w-72">
      {["none", "vertical", "horizontal", "both"].map((resize) => (
        <div key={resize} className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{resize}</span>
          <Textarea variant="outline" resize={resize} placeholder={`resize: ${resize}`} />
        </div>
      ))}
    </div>
  ),
}

export const Disabled = { args: { placeholder: "비활성화 상태", disabled: true } }

export const Invalid = { args: { placeholder: "오류 상태", "aria-invalid": true } }
