import BlogDetailActionRail from "@/components/domain/blog-detail/ui/BlogDetailActionRail";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogDetailActionRail> } */
const meta = {
  title: "Domain/BlogDetail/UI/BlogDetailActionRail",
  component: BlogDetailActionRail,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    likes: { control: "number" },
    bookmarks: { control: "number" },
  },
};

export default meta;

export const Default = {
  args: {
    likes: 18,
    bookmarks: 7,
  },
};

export const HighEngagement = {
  args: {
    likes: 342,
    bookmarks: 87,
  },
};

export const LowEngagement = {
  args: {
    likes: 1,
    bookmarks: 0,
  },
};
