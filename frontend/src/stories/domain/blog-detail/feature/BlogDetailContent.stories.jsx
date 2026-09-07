import BlogDetailContent from "@/components/domain/blog-detail/feature/BlogDetailContent";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogDetailContent> } */
const meta = {
  title: "Domain/BlogDetail/Feature/BlogDetailContent",
  component: BlogDetailContent,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

const mockContentBlocks = [
  {
    id: "block-1",
    type: "paragraph",
    text: "프론트엔드 개발에서 컴포넌트 설계는 재사용성과 유지보수성을 동시에 고려해야 합니다. 특히 대규모 프로젝트에서는 일관된 디자인 시스템과 명확한 컴포넌트 경계가 중요합니다.",
  },
  {
    id: "block-2",
    type: "image",
    caption: "컴포넌트 계층 구조를 시각적으로 표현한 다이어그램. Atomic Design 원칙에 따라 구분됩니다.",
  },
  {
    id: "block-3",
    type: "paragraph",
    text: "React의 컴포넌트 기반 아키텍처는 UI를 독립적이고 재사용 가능한 조각으로 분리하여, 각 컴포넌트가 자신의 상태를 관리하도록 설계됩니다.",
  },
  {
    id: "block-4",
    type: "paragraph",
    text: "Next.js는 React를 기반으로 한 풀스택 프레임워크로, 서버 사이드 렌더링과 정적 사이트 생성을 지원하여 성능과 SEO를 동시에 향상시킵니다.",
  },
];

const mockAuthorCard = {
  initials: "KM",
  name: "김민준",
  role: "Frontend Engineer",
  bio: "React와 Next.js를 중심으로 사용자 경험을 개선하는 프론트엔드 개발자입니다. 디자인 시스템 설계와 성능 최적화에 관심이 많습니다.",
  badges: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
};

export const Default = {
  render: () => (
    <div className="w-full max-w-[820px]">
      <BlogDetailContent
        adminActions={["편집", "삭제", "미리보기", "발행"]}
        authorCard={mockAuthorCard}
        category="Engineering"
        contentBlocks={mockContentBlocks}
        excerpt="재사용 가능한 컴포넌트를 중심으로 일관된 사용자 경험을 만드는 방법을 탐구합니다."
        publishedAt="2025년 5월 12일"
        readTime="읽기 8분"
        title="컴포넌트 기반 아키텍처와 디자인 시스템"
        updatedAt="2025년 5월 20일 업데이트"
        visibilityLabel="Public"
      />
    </div>
  ),
};

export const WithoutAuthorCard = {
  render: () => (
    <div className="w-full max-w-[820px]">
      <BlogDetailContent
        adminActions={["편집", "삭제"]}
        authorCard={null}
        category="Tutorial"
        contentBlocks={mockContentBlocks}
        excerpt="Storybook을 활용하여 UI 컴포넌트를 독립적으로 개발하고 문서화하는 방법을 소개합니다."
        publishedAt="2025년 3월 20일"
        readTime="읽기 5분"
        title="Storybook으로 컴포넌트 문서화하기"
        updatedAt="2025년 3월 20일"
        visibilityLabel="Public"
      />
    </div>
  ),
};

export const EmptyContent = {
  render: () => (
    <div className="w-full max-w-[820px]">
      <BlogDetailContent
        adminActions={["편집"]}
        authorCard={mockAuthorCard}
        category="Draft"
        contentBlocks={[]}
        excerpt="아직 내용이 작성되지 않은 초안 상태의 글입니다."
        publishedAt=""
        readTime=""
        title="작성 중인 아티클"
        updatedAt=""
        visibilityLabel="Draft"
      />
    </div>
  ),
};
