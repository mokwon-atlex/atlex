import { Capsule } from "@/components/common/ui/capsule";

/** @type { import('@storybook/react').Meta<typeof Capsule> } */
const meta = {
  title: "Common/UI/Capsule",
  component: Capsule,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "ghost", "success"],
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
    children: { control: "text" },
  },
};

export default meta;

export const Default = {
  args: {
    children: "Capsule",
    variant: "default",
    size: "default",
  },
};

export const Secondary = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Outline = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

export const Ghost = {
  args: {
    children: "Ghost",
    variant: "ghost",
  },
};

export const Small = {
  args: {
    children: "Small",
    size: "sm",
  },
};

export const Large = {
  args: {
    children: "Large",
    size: "lg",
  },
};

export const Success = {
  args: {
    children: "Success",
    variant: "success",
  },
};

export const AllVariants = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Capsule variant="default">Default</Capsule>
      <Capsule variant="secondary">Secondary</Capsule>
      <Capsule variant="outline">Outline</Capsule>
      <Capsule variant="ghost">Ghost</Capsule>
      <Capsule variant="success">Success</Capsule>
    </div>
  ),
};

export const AllSizes = {
  render: () => (
    <div className="flex items-center gap-2">
      <Capsule size="sm">Small</Capsule>
      <Capsule size="default">Default</Capsule>
      <Capsule size="lg">Large</Capsule>
    </div>
  ),
};
