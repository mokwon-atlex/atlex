import BlogHomeSidebarTagsLayout from "@/components/domain/blog-home/layout/BlogHomeSidebarTagsLayout";

const mockTags = [
  { id: "all", label: "전체 글", count: 78, active: true },
  { id: "tag-1", label: "태그 1", count: 12 },
  { id: "tag-2", label: "태그 2", count: 9 },
  { id: "tag-3", label: "태그 3", count: 8 },
  { id: "tag-4", label: "태그 4", count: 6 },
];

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogHomeSidebarTagsLayout> } */
const meta = {
  title: "Domain/BlogHome/Layout/BlogHomeSidebarTagsLayout",
  component: BlogHomeSidebarTagsLayout,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    onTagSelect: { action: "tagSelected" },
  },
};

export default meta;

export const Default = {
  args: {
    tags: mockTags,
  },
};

export const SecondTagActive = {
  args: {
    tags: [
      { id: "all", label: "전체 글", count: 78 },
      { id: "tag-1", label: "태그 1", count: 12, active: true },
      { id: "tag-2", label: "태그 2", count: 9 },
      { id: "tag-3", label: "태그 3", count: 8 },
    ],
  },
};

export const ManyTags = {
  args: {
    tags: [
      { id: "all", label: "전체 글", count: 120, active: true },
      { id: "tag-1", label: "React", count: 34 },
      { id: "tag-2", label: "TypeScript", count: 28 },
      { id: "tag-3", label: "Next.js", count: 20 },
      { id: "tag-4", label: "CSS", count: 15 },
      { id: "tag-5", label: "JavaScript", count: 12 },
      { id: "tag-6", label: "TailwindCSS", count: 8 },
      { id: "tag-7", label: "Testing", count: 3 },
    ],
  },
};

export const CustomTitle = {
  args: {
    title: "주제별 분류",
    description: "주제별로 글을 모아볼 수 있습니다.",
    tags: mockTags,
  },
};
