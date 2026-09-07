"use client";

import CategoryBlogHomeContent from "@/components/domain/category/feature/CategoryBlogHomeContent";

/** @type { import('@storybook/nextjs-vite').Meta<typeof CategoryBlogHomeContent> } */
const meta = {
  title: "Domain/Category/Feature/CategoryBlogHomeContent",
  component: CategoryBlogHomeContent,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    categories: { control: "object" },
    feed: { control: "object" },
    profile: { control: "object" },
    tags: { control: "object" },
  },
};
export default meta;

const mockCategories = [
  { id: "all", label: "전체 글", description: "블로그 홈의 전체 게시물을 한 번에 확인합니다." },
  { id: "ui-lab", label: "UI 실험", description: "레이아웃과 컴포넌트 인터랙션을 다듬는 기록입니다.", postIds: [1] },
  { id: "work-log", label: "작업 로그", description: "작업 과정과 회고를 짧은 메모처럼 남깁니다.", postIds: [2] },
  { id: "design-notes", label: "디자인 메모", description: "작은 시각적 조정과 레이아웃 메모를 정리합니다.", postIds: [1, 3] },
];

const mockProfile = {
  name: "siho",
  bio: "프론트엔드 개발자입니다.",
  avatar: null,
  followers: 128,
  following: 64,
};

const mockPosts = [
  {
    id: 1,
    title: "Tailwind CSS로 반응형 레이아웃 설계하기",
    excerpt: "다양한 화면 크기에서 일관성 있는 레이아웃을 유지하는 방법을 알아봅니다.",
    date: "2024-05-10",
    author: "siho",
    likes: 42,
    comments: 5,
    cover: { variant: "stack", tone: "blue", size: "medium", main: "Layout", caption: "DESIGN" },
  },
  {
    id: 2,
    title: "인터랙션 디자인 원칙",
    excerpt: "사용자 경험을 극대화하는 인터랙션 패턴을 살펴봅니다.",
    date: "2024-05-08",
    author: "siho",
    likes: 28,
    comments: 3,
    cover: { variant: "orbit", tone: "cyan", size: "medium", main: "UX", caption: "INTERACTION" },
  },
  {
    id: 3,
    title: "주간 회고 #12",
    excerpt: "이번 주에 진행한 작업과 배운 점들을 회고합니다.",
    date: "2024-05-06",
    author: "siho",
    likes: 15,
    comments: 0,
    cover: { variant: "minimal", tone: "cream", size: "small", main: "#12" },
  },
];

const mockFeed = {
  posts: mockPosts,
};

const mockTags = [
  { id: "all", label: "전체", active: true },
  { id: "ui", label: "UI" },
  { id: "design", label: "디자인" },
  { id: "weekly", label: "주간 회고" },
];

export const Default = {
  args: {
    categories: mockCategories,
    feed: mockFeed,
    profile: mockProfile,
    tags: mockTags,
  },
};
