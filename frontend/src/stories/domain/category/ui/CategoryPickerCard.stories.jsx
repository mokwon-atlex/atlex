import CategoryPickerCard from "@/components/domain/category/ui/CategoryPickerCard";

/** @type { import('@storybook/nextjs-vite').Meta<typeof CategoryPickerCard> } */
const meta = {
  title: "Domain/Category/UI/CategoryPickerCard",
  component: CategoryPickerCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    selected: { control: "boolean", description: "선택된 상태 여부" },
    onSelect: { action: "selected" },
    category: { control: "object" },
  },
  decorators: [
    (Story) => (
      <div className="w-[240px]">
        <Story />
      </div>
    ),
  ],
};
export default meta;

const mockCategory = {
  id: "ui-lab",
  label: "UI 실험",
  description: "레이아웃과 컴포넌트 인터랙션을 다듬는 기록입니다.",
  postCount: 5,
  latestPost: { date: "2024-05-10" },
};

export const Default = {
  args: {
    category: mockCategory,
    selected: false,
  },
};

export const Selected = {
  args: {
    category: mockCategory,
    selected: true,
  },
};

export const NoRecentPost = {
  args: {
    category: {
      ...mockCategory,
      id: "ready-soon",
      label: "준비 중",
      description: "아직 등록된 게시물이 없어 빈 상태를 함께 확인할 수 있습니다.",
      postCount: 0,
      latestPost: null,
    },
    selected: false,
  },
};

export const ManyPosts = {
  args: {
    category: {
      ...mockCategory,
      id: "reference-box",
      label: "레퍼런스 수집",
      description: "나중에 다시 참고할 만한 자료를 모아둡니다.",
      postCount: 42,
      latestPost: { date: "2024-05-12" },
    },
    selected: false,
  },
};
