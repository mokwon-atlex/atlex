import PostEditorTagChip from "@/components/domain/post-editor/ui/PostEditorTagChip";

/** @type { import('@storybook/nextjs-vite').Meta<typeof PostEditorTagChip> } */
const meta = {
  title: "Domain/PostEditor/UI/PostEditorTagChip",
  component: PostEditorTagChip,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["automatic", "manual"],
    },
    label: { control: "text" },
  },
  args: {
    label: "공지",
    variant: "automatic",
  },
};

export default meta;

export const Automatic = {
  args: {
    label: "공지",
    variant: "automatic",
  },
};

export const Manual = {
  args: {
    label: "운영",
    variant: "manual",
  },
};

export const Removable = {
  args: {
    label: "운영",
    variant: "manual",
    onRemove: () => {},
  },
};

export const AllVariants = {
  render: () => (
    <div className="flex flex-wrap gap-2 items-center">
      <PostEditorTagChip label="자동 태그" variant="automatic" />
      <PostEditorTagChip label="수동 태그" variant="manual" />
      <PostEditorTagChip label="삭제 가능" variant="manual" onRemove={() => {}} />
    </div>
  ),
};
