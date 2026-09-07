import BlogMainPostGrid from "@/components/domain/blog-main/feature/BlogMainPostGrid";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogMainPostGrid> } */
const meta = {
  title: "Domain/BlogMain/Feature/BlogMainPostGrid",
  component: BlogMainPostGrid,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    emptyMessage: { control: "text", description: "게시물이 없을 때 표시할 메시지" },
    posts: { control: "object" },
  },
};
export default meta;

const mockPosts = [
  {
    id: 1,
    title: "Tailwind CSS로 반응형 레이아웃 설계하기",
    excerpt: "다양한 화면 크기에서 일관성 있는 레이아웃을 유지하는 방법을 알아봅니다.",
    eyebrow: "UI 실험",
    publishedAt: "2024-05-10",
    comments: 5,
    author: "siho",
    likes: 42,
    cover: { variant: "stack", tone: "blue", size: "medium", main: "Layout", caption: "DESIGN" },
  },
  {
    id: 2,
    title: "인터랙션 디자인 원칙",
    excerpt: "사용자 경험을 극대화하는 인터랙션 패턴을 살펴봅니다.",
    eyebrow: "디자인 메모",
    publishedAt: "2024-05-08",
    comments: 3,
    author: "siho",
    likes: 28,
    cover: { variant: "orbit", tone: "cyan", size: "medium", main: "UX", caption: "INTERACTION" },
  },
  {
    id: 3,
    title: "주간 회고 #12",
    excerpt: "이번 주에 진행한 작업과 배운 점들을 회고합니다.",
    eyebrow: "주간 회고",
    publishedAt: "2024-05-06",
    comments: 0,
    author: "siho",
    likes: 15,
    cover: { variant: "minimal", tone: "cream", size: "small", main: "#12" },
  },
  {
    id: 4,
    title: "컴포넌트 설계 패턴 정리",
    excerpt: "재사용 가능한 UI 컴포넌트를 설계하는 여러 패턴들을 정리했습니다.",
    eyebrow: null,
    publishedAt: "2024-05-04",
    comments: 7,
    author: "siho",
    likes: 61,
    cover: { variant: "poster", tone: "slate", size: "medium", main: "Pattern", caption: "COMPONENT", symbol: "C" },
  },
  {
    id: 5,
    title: "Wave 커버 디자인 실험",
    excerpt: "바 차트 형태의 커버 디자인으로 게시물에 시각적 다양성을 부여합니다.",
    eyebrow: "UI 실험",
    publishedAt: "2024-05-02",
    comments: 2,
    author: "siho",
    likes: 33,
    cover: {
      variant: "wave",
      tone: "ink",
      size: "medium",
      main: "Wave",
      bars: [3, 7, 10, 5, 8, 12, 6, 9, 11, 4],
    },
  },
];

export const Default = {
  args: {
    posts: mockPosts,
    emptyMessage: "게시물이 없습니다.",
  },
};

export const SinglePost = {
  args: {
    posts: [mockPosts[0]],
    emptyMessage: "게시물이 없습니다.",
  },
};

export const Empty = {
  args: {
    posts: [],
    emptyMessage: "조건에 맞는 게시물이 없습니다.",
  },
};

export const EmptyCustomMessage = {
  args: {
    posts: [],
    emptyMessage: "선택한 카테고리에 게시물이 없습니다. 다른 카테고리를 선택해보세요.",
  },
};
