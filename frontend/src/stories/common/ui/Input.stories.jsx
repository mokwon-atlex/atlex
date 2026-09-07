import { Input } from "@/components/common/ui/input";

/** @type { import('@storybook/nextjs-vite').Meta<typeof Input> } */
const meta = {
  title: "Common/UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "filled", "ghost"],
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "url", "tel"],
    },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
};

export default meta;

export const Default = {
  args: { placeholder: "텍스트를 입력하세요" },
};

export const Outline = {
  args: { variant: "outline", placeholder: "텍스트를 입력하세요" },
};

export const Filled = {
  args: { variant: "filled", placeholder: "텍스트를 입력하세요" },
};

export const Ghost = {
  args: { variant: "ghost", placeholder: "텍스트를 입력하세요" },
};

export const Sizes = {
  render: () => (
    <div className="flex flex-col gap-3 w-72">
      <Input size="sm" placeholder="Small" />
      <Input size="default" placeholder="Default" />
      <Input size="lg" placeholder="Large" />
    </div>
  ),
};

export const AllVariants = {
  render: () => (
    <div className="flex flex-col gap-3 w-72">
      <Input variant="default" placeholder="Default" />
      <Input variant="outline" placeholder="Outline" />
      <Input variant="filled" placeholder="Filled" />
      <Input variant="ghost" placeholder="Ghost" />
    </div>
  ),
};

export const Disabled = {
  args: { placeholder: "비활성화 상태", disabled: true },
};

export const Invalid = {
  args: { placeholder: "오류 상태", "aria-invalid": true },
};
