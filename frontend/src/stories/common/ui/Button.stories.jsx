import { Button } from "@/components/common/ui/button";

/** @type { import('@storybook/nextjs-vite').Meta<typeof Button> } */
const meta = {
  title: "Common/UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
    disabled: { control: "boolean" },
    children: { control: "text" },
  },
};

export default meta;

export const Default = {
  args: {
    children: "Button",
    variant: "default",
    size: "default",
  },
};

export const Outline = {
  args: {
    children: "Button",
    variant: "outline",
  },
};

export const Secondary = {
  args: {
    children: "Button",
    variant: "secondary",
  },
};

export const Ghost = {
  args: {
    children: "Button",
    variant: "ghost",
  },
};

export const Destructive = {
  args: {
    children: "Button",
    variant: "destructive",
  },
};

export const Link = {
  args: {
    children: "Button",
    variant: "link",
  },
};

export const Sizes = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button size="xs">XSmall</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const AllVariants = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="default">Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const Disabled = {
  args: {
    children: "Disabled",
    disabled: true,
  },
};
