import BlogHomeFeedItemFooterLayout from "@/components/domain/blog-home/layout/BlogHomeFeedItemFooterLayout";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogHomeFeedItemFooterLayout> } */
const meta = {
  title: "Domain/BlogHome/Layout/BlogHomeFeedItemFooterLayout",
  component: BlogHomeFeedItemFooterLayout,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    isLiked: { control: "boolean" },
    likes: { control: "number" },
    comments: { control: "number" },
    bookmarks: { control: "number" },
    date: { control: "text" },
  },
};

export default meta;

export const Default = {
  args: {
    date: "2026.03.23",
    likes: 24,
    comments: 8,
    bookmarks: 2,
    isLiked: false,
  },
};

export const Liked = {
  args: {
    date: "2026.03.23",
    likes: 25,
    comments: 8,
    bookmarks: 2,
    isLiked: true,
  },
};

export const ZeroCounts = {
  args: {
    date: "2026.01.01",
    likes: 0,
    comments: 0,
    bookmarks: 0,
    isLiked: false,
  },
};

export const HighCounts = {
  args: {
    date: "2025.12.25",
    likes: 1204,
    comments: 389,
    bookmarks: 92,
    isLiked: true,
  },
};
