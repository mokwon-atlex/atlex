import BlogDetailHero from "@/components/domain/blog-detail/ui/BlogDetailHero";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogDetailHero> } */
const meta = {
  title: "Domain/BlogDetail/UI/BlogDetailHero",
  component: BlogDetailHero,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    category: { control: "text" },
    title: { control: "text" },
    excerpt: { control: "text" },
    publishedAt: { control: "text" },
    updatedAt: { control: "text" },
    readTime: { control: "text" },
    visibilityLabel: { control: "text" },
  },
};

export default meta;

const defaultAdminActions = ["편집", "삭제", "미리보기", "발행"];

export const Default = {
  args: {
    adminActions: defaultAdminActions,
    category: "Engineering",
    title: "컴포넌트 기반 아키텍처와 디자인 시스템",
    excerpt:
      "재사용 가능한 컴포넌트를 중심으로 일관된 사용자 경험을 만드는 방법을 탐구합니다. 디자인 토큰부터 컴포넌트 API 설계까지 실무 관점에서 살펴봅니다.",
    publishedAt: "2025년 5월 12일",
    updatedAt: "2025년 5월 20일 업데이트",
    readTime: "읽기 8분",
    visibilityLabel: "Public",
  },
};

export const LongTitle = {
  args: {
    adminActions: defaultAdminActions,
    category: "Performance",
    title: "Next.js App Router에서 Server Component와 Client Component를 효과적으로 조합하는 전략",
    excerpt:
      "React Server Components의 등장으로 프론트엔드 개발 패러다임이 크게 변화했습니다. 서버와 클라이언트 컴포넌트를 적절히 조합하여 성능과 개발 경험을 동시에 향상시키는 방법을 알아봅니다.",
    publishedAt: "2025년 4월 3일",
    updatedAt: "2025년 4월 15일 업데이트",
    readTime: "읽기 12분",
    visibilityLabel: "Public",
  },
};

export const DraftPost = {
  args: {
    adminActions: ["편집", "삭제", "미리보기", "발행"],
    category: "Design",
    title: "Tailwind CSS로 반응형 레이아웃 구성하기",
    excerpt:
      "유틸리티 클래스 기반 접근 방식으로 다양한 화면 크기에 최적화된 레이아웃을 구현하는 실전 가이드입니다.",
    publishedAt: "2025년 6월 1일",
    updatedAt: "2025년 6월 1일",
    readTime: "읽기 6분",
    visibilityLabel: "Draft",
  },
};

export const MinimalAdminActions = {
  args: {
    adminActions: ["편집"],
    category: "Tutorial",
    title: "Storybook으로 컴포넌트 문서화하기",
    excerpt: "Storybook을 활용하여 UI 컴포넌트를 독립적으로 개발하고 문서화하는 방법을 소개합니다.",
    publishedAt: "2025년 3월 20일",
    updatedAt: "2025년 3월 20일",
    readTime: "읽기 5분",
    visibilityLabel: "Public",
  },
};
