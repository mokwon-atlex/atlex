import BlogHomeSidebarQuickActionsLayout from "@/components/domain/blog-home/layout/BlogHomeSidebarQuickActionsLayout";

const mockActions = [
  { id: "follow", label: "팔로우" },
  { id: "category", label: "카테고리" },
  { id: "graph", label: "그래프 보기" },
];

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogHomeSidebarQuickActionsLayout> } */
const meta = {
  title: "Domain/BlogHome/Layout/BlogHomeSidebarQuickActionsLayout",
  component: BlogHomeSidebarQuickActionsLayout,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    title: { control: "text" },
  },
};

export default meta;

export const Default = {
  args: {
    actions: mockActions,
    actionOverrides: {},
  },
};

export const FollowOnly = {
  args: {
    actions: [{ id: "follow", label: "팔로우" }],
    actionOverrides: {},
  },
};

export const CategoryAndGraph = {
  args: {
    actions: [
      { id: "category", label: "카테고리" },
      { id: "graph", label: "그래프 보기" },
    ],
    actionOverrides: {},
  },
};

export const CustomTitle = {
  args: {
    actions: mockActions,
    actionOverrides: {},
    title: "빠른 메뉴",
  },
};
