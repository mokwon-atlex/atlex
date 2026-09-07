import { Separator } from "@/components/common/ui/separator"

/** @type { import('@storybook/nextjs-vite').Meta<typeof Separator> } */
const meta = {
  title: "Common/UI/Separator",
  component: Separator,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "muted", "thick", "dashed"] },
    orientation: { control: "radio", options: ["horizontal", "vertical"] },
  },
}

export default meta

export const Default = {
  decorators: [(Story) => <div className="w-64"><Story /></div>],
  args: { variant: "default" },
}

export const Muted = {
  decorators: [(Story) => <div className="w-64"><Story /></div>],
  args: { variant: "muted" },
}

export const Thick = {
  decorators: [(Story) => <div className="w-64"><Story /></div>],
  args: { variant: "thick" },
}

export const Dashed = {
  decorators: [(Story) => <div className="w-64"><Story /></div>],
  args: { variant: "dashed" },
}

export const AllVariants = {
  render: () => (
    <div className="flex w-64 flex-col gap-4">
      {["default", "muted", "thick", "dashed"].map((variant) => (
        <div key={variant} className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{variant}</span>
          <Separator variant={variant} />
        </div>
      ))}
    </div>
  ),
}

export const Vertical = {
  render: () => (
    <div className="flex h-8 items-center gap-4">
      <span className="text-sm">왼쪽</span>
      <Separator orientation="vertical" />
      <span className="text-sm">오른쪽</span>
    </div>
  ),
}
