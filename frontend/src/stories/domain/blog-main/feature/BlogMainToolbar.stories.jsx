import BlogMainToolbar from "@/components/domain/blog-main/feature/BlogMainToolbar";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogMainToolbar> } */
const meta = {
  title: "Domain/BlogMain/Feature/BlogMainToolbar",
  component: BlogMainToolbar,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    activeFilterId: {
      control: "select",
      options: ["all", "following", "popular", "recent"],
      description: "현재 활성화된 필터 ID",
    },
    activePeriodId: {
      control: "select",
      options: ["1w", "1m", "3m", "6m", "1y", "all"],
      description: "현재 활성화된 기간 ID",
    },
  },
};
export default meta;

const filters = [
  { id: "all", label: "전체" },
  { id: "following", label: "팔로잉" },
  { id: "popular", label: "인기" },
  { id: "recent", label: "최신" },
];

const periods = [
  { id: "1w", label: "1주" },
  { id: "1m", label: "1개월" },
  { id: "3m", label: "3개월" },
  { id: "1y", label: "1년" },
  { id: "all", label: "전체" },
];

export const Default = {
  args: {
    filters,
    periods,
    activeFilterId: "all",
    activePeriodId: "1m",
  },
};

export const FollowingAndWeek = {
  args: {
    filters,
    periods,
    activeFilterId: "following",
    activePeriodId: "1w",
  },
};

export const PopularAndYear = {
  args: {
    filters,
    periods,
    activeFilterId: "popular",
    activePeriodId: "1y",
  },
};
