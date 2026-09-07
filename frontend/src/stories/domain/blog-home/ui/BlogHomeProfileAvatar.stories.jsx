import BlogHomeProfileAvatar from "@/components/domain/blog-home/ui/BlogHomeProfileAvatar";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogHomeProfileAvatar> } */
const meta = {
  title: "Domain/BlogHome/UI/BlogHomeProfileAvatar",
  component: BlogHomeProfileAvatar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "lg"],
    },
    showLabel: { control: "boolean" },
    label: { control: "text" },
    alt: { control: "text" },
    src: { control: "text" },
  },
};

export default meta;

export const Default = {
  args: {
    size: "lg",
    label: "프로필 사진",
    showLabel: true,
  },
};

export const SmallSize = {
  args: {
    size: "sm",
    label: "프로필 사진",
    showLabel: true,
  },
};

export const WithImage = {
  args: {
    size: "lg",
    src: "https://avatars.githubusercontent.com/u/1?v=4",
    alt: "GitHub 사용자 아바타",
    showLabel: false,
  },
};

export const MultiWordLabel = {
  args: {
    size: "lg",
    label: "홍 길동",
    showLabel: true,
  },
};

export const NoLabel = {
  args: {
    size: "lg",
    showLabel: false,
  },
};

export const SizeComparison = {
  render: () => (
    <div className="flex items-end gap-6">
      <BlogHomeProfileAvatar size="sm" label="프로필 사진" showLabel />
      <BlogHomeProfileAvatar size="lg" label="프로필 사진" showLabel />
    </div>
  ),
};
