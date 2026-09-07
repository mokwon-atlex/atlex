import { Bold, Italic, Underline } from "lucide-react";
import { Toggle } from "@/components/common/ui/toggle";

/** @type { import('@storybook/nextjs-vite').Meta<typeof Toggle> } */
const meta = {
  title: "Common/UI/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
    },
    disabled: { control: "boolean" },
    defaultPressed: { control: "boolean" },
    children: { control: "text" },
  },
};

export default meta;

export const Default = {
  args: {
    children: "Toggle",
    variant: "default",
    size: "default",
  },
};

export const Outline = {
  args: {
    children: "Toggle",
    variant: "outline",
  },
};

export const Pressed = {
  args: {
    children: "Pressed",
    variant: "default",
    size: "default",
    defaultPressed: true,
  },
};

export const Disabled = {
  args: {
    children: "Disabled",
    variant: "default",
    size: "default",
    disabled: true,
  },
};

export const Sizes = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle size="sm">Small</Toggle>
      <Toggle size="default">Default</Toggle>
      <Toggle size="lg">Large</Toggle>
    </div>
  ),
};

export const AllVariants = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle variant="default">Default</Toggle>
      <Toggle variant="outline">Outline</Toggle>
    </div>
  ),
};

export const WithIcon = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle aria-label="Bold">
        <Bold />
      </Toggle>
      <Toggle aria-label="Italic">
        <Italic />
      </Toggle>
      <Toggle aria-label="Underline">
        <Underline />
      </Toggle>
    </div>
  ),
};

export const WithIconAndText = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle>
        <Bold />
        Bold
      </Toggle>
      <Toggle variant="outline">
        <Italic />
        Italic
      </Toggle>
    </div>
  ),
};
