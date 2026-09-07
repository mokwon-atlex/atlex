import BlogHomeTagChip from "@/components/domain/blog-home/ui/BlogHomeTagChip";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogHomeTagChip> } */
const meta = {
  title: "Domain/BlogHome/UI/BlogHomeTagChip",
  component: BlogHomeTagChip,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    active: { control: "boolean" },
    fullWidth: { control: "boolean" },
    label: { control: "text" },
    count: { control: "number" },
    onClick: { action: "clicked" },
  },
};

export default meta;

export const Default = {
  args: {
    label: "태그 1",
    count: 12,
    active: false,
    fullWidth: false,
  },
};

export const Active = {
  args: {
    label: "태그 1",
    count: 12,
    active: true,
    fullWidth: false,
  },
};

export const WithoutCount = {
  args: {
    label: "태그만",
    active: false,
    fullWidth: false,
  },
};

export const FullWidth = {
  render: () => (
    <div className="w-60">
      <BlogHomeTagChip label="전체 글" count={78} active={false} fullWidth />
    </div>
  ),
};

export const FullWidthActive = {
  render: () => (
    <div className="w-60">
      <BlogHomeTagChip label="전체 글" count={78} active={true} fullWidth />
    </div>
  ),
};
