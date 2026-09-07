import BlogHomeSidebarStatsLayout from "@/components/domain/blog-home/layout/BlogHomeSidebarStatsLayout";

const mockStats = [
  { id: "followers", label: "팔로워", value: "120" },
  { id: "following", label: "팔로잉", value: "85" },
];

const mockStatsWithPosts = [
  { id: "followers", label: "팔로워", value: "120" },
  { id: "following", label: "팔로잉", value: "85" },
  { id: "posts", label: "게시글", value: "38" },
];

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogHomeSidebarStatsLayout> } */
const meta = {
  title: "Domain/BlogHome/Layout/BlogHomeSidebarStatsLayout",
  component: BlogHomeSidebarStatsLayout,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

export const Default = {
  args: {
    stats: mockStats,
  },
};

export const WithPosts = {
  args: {
    stats: mockStatsWithPosts,
  },
};

export const HighNumbers = {
  args: {
    stats: [
      { id: "followers", label: "팔로워", value: "12,430" },
      { id: "following", label: "팔로잉", value: "320" },
    ],
  },
};

export const Empty = {
  args: {
    stats: [],
  },
};
