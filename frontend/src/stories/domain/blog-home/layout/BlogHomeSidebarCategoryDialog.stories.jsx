import BlogHomeSidebarCategoryDialog from "@/components/domain/blog-home/layout/BlogHomeSidebarCategoryDialog";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogHomeSidebarCategoryDialog> } */
const meta = {
  title: "Domain/BlogHome/Layout/BlogHomeSidebarCategoryDialog",
  component: BlogHomeSidebarCategoryDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    actionId: {
      control: "select",
      options: ["category"],
    },
    label: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
    body: { control: "text" },
    showHeader: { control: "boolean" },
    dialogSize: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;

export const Default = {
  args: {
    actionId: "category",
    label: "카테고리",
    title: "카테고리",
    description:
      "카테고리 모달은 일단 표시만 해두고, 내부 콘텐츠는 추후 추가할 예정입니다.",
    body: "공통 Dialog 연결은 완료된 상태입니다.",
    showHeader: true,
    dialogSize: "md",
  },
};

export const NoHeader = {
  args: {
    actionId: "category",
    label: "카테고리",
    body: "헤더 없이 본문만 표시됩니다.",
    showHeader: false,
    dialogSize: "md",
  },
};

export const CustomContent = {
  args: {
    actionId: "category",
    label: "카테고리",
    title: "카테고리 목록",
    description: "원하는 카테고리를 선택하세요.",
    body: "카테고리 A, 카테고리 B, 카테고리 C",
    showHeader: true,
    dialogSize: "md",
  },
};

export const SmallDialog = {
  args: {
    actionId: "category",
    label: "카테고리",
    title: "카테고리",
    description: "작은 다이얼로그입니다.",
    showHeader: true,
    dialogSize: "sm",
  },
};
