import { UserPlus, FolderOpen, BarChart3 } from "lucide-react";

import BlogHomePillButton from "@/components/domain/blog-home/ui/BlogHomePillButton";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogHomePillButton> } */
const meta = {
  title: "Domain/BlogHome/UI/BlogHomePillButton",
  component: BlogHomePillButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    tone: {
      control: "select",
      options: ["accent", "neutral", "soft", "warm"],
    },
    size: {
      control: "select",
      options: ["md", "lg"],
    },
    iconOnly: { control: "boolean" },
    label: { control: "text" },
  },
};

export default meta;

export const Default = {
  args: {
    label: "팔로우",
    tone: "neutral",
    size: "md",
    iconOnly: false,
  },
};

export const WithIcon = {
  args: {
    label: "팔로우",
    icon: UserPlus,
    tone: "accent",
    size: "md",
    iconOnly: false,
  },
};

export const IconOnly = {
  args: {
    label: "팔로우",
    ariaLabel: "팔로우",
    icon: UserPlus,
    tone: "neutral",
    size: "md",
    iconOnly: true,
  },
};

export const AccentTone = {
  args: {
    label: "팔로우",
    icon: UserPlus,
    tone: "accent",
    size: "md",
    iconOnly: false,
  },
};

export const SoftTone = {
  args: {
    label: "그래프 보기",
    icon: BarChart3,
    tone: "soft",
    size: "md",
    iconOnly: false,
  },
};

export const AllTones = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <BlogHomePillButton label="accent" tone="accent" icon={UserPlus} />
      <BlogHomePillButton label="neutral" tone="neutral" icon={FolderOpen} />
      <BlogHomePillButton label="soft" tone="soft" icon={BarChart3} />
      <BlogHomePillButton label="warm" tone="warm" />
    </div>
  ),
};
