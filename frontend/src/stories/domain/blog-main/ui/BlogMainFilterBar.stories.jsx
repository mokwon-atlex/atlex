import BlogMainFilterBar from "@/components/domain/blog-main/ui/BlogMainFilterBar";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogMainFilterBar> } */
const meta = {
  title: "Domain/BlogMain/UI/BlogMainFilterBar",
  component: BlogMainFilterBar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    activeFilterId: {
      control: "select",
      options: ["all", "following", "popular", "recent"],
      description: "현재 활성화된 필터 ID",
    },
    filters: { control: "object" },
  },
};
export default meta;

const filters = [
  { id: "all", label: "전체" },
  { id: "following", label: "팔로잉" },
  { id: "popular", label: "인기" },
  { id: "recent", label: "최신" },
];

export const Default = {
  args: {
    filters,
    activeFilterId: "all",
  },
};

export const FollowingActive = {
  args: {
    filters,
    activeFilterId: "following",
  },
};

export const PopularActive = {
  args: {
    filters,
    activeFilterId: "popular",
  },
};

export const SingleFilter = {
  args: {
    filters: [{ id: "all", label: "전체" }],
    activeFilterId: "all",
  },
};

export const EmptyFilters = {
  args: {
    filters: [],
    activeFilterId: undefined,
  },
};
