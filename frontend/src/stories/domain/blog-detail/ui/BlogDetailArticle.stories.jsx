import BlogDetailArticle from "@/components/domain/blog-detail/ui/BlogDetailArticle";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogDetailArticle> } */
const meta = {
  title: "Domain/BlogDetail/UI/BlogDetailArticle",
  component: BlogDetailArticle,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

const textOnlyBlocks = [
  {
    id: "block-1",
    type: "paragraph",
    text: "프론트엔드 개발에서 컴포넌트 설계는 재사용성과 유지보수성을 동시에 고려해야 합니다. 특히 대규모 프로젝트에서는 일관된 디자인 시스템과 명확한 컴포넌트 경계가 중요합니다.",
  },
  {
    id: "block-2",
    type: "paragraph",
    text: "React의 컴포넌트 기반 아키텍처는 UI를 독립적이고 재사용 가능한 조각으로 분리하여, 각 컴포넌트가 자신의 상태를 관리하도록 설계됩니다. 이를 통해 복잡한 UI도 체계적으로 구성할 수 있습니다.",
  },
  {
    id: "block-3",
    type: "paragraph",
    text: "Next.js는 React를 기반으로 한 풀스택 프레임워크로, 서버 사이드 렌더링과 정적 사이트 생성을 지원하여 성능과 SEO를 동시에 향상시킵니다.",
  },
];

const mixedBlocks = [
  {
    id: "block-1",
    type: "paragraph",
    text: "디자인 시스템은 제품 전반에 걸쳐 일관된 사용자 경험을 제공하기 위한 규칙, 원칙, 구성 요소의 집합입니다. 잘 구성된 디자인 시스템은 개발 속도를 높이고 팀 간 협업을 원활하게 합니다.",
  },
  {
    id: "block-2",
    type: "image",
    caption: "컴포넌트 계층 구조를 시각적으로 표현한 다이어그램. Atomic Design 원칙에 따라 원자, 분자, 유기체로 구분됩니다.",
  },
  {
    id: "block-3",
    type: "paragraph",
    text: "Storybook은 UI 컴포넌트를 독립적으로 개발하고 문서화하기 위한 도구입니다. 각 컴포넌트의 다양한 상태를 시각적으로 확인하고 인터랙션을 테스트할 수 있습니다.",
  },
  {
    id: "block-4",
    type: "image",
    caption: "Storybook에서 컴포넌트를 독립적으로 렌더링하는 모습. Controls 패널을 통해 props를 실시간으로 변경할 수 있습니다.",
  },
  {
    id: "block-5",
    type: "paragraph",
    text: "Tailwind CSS는 유틸리티 우선 CSS 프레임워크로, 미리 정의된 클래스를 조합하여 빠르게 스타일을 적용할 수 있습니다. 커스텀 디자인 시스템과도 쉽게 통합됩니다.",
  },
];

export const Default = {
  args: {
    contentBlocks: textOnlyBlocks,
  },
};

export const WithImages = {
  args: {
    contentBlocks: mixedBlocks,
  },
};

export const Empty = {
  args: {
    contentBlocks: [],
  },
};

export const SingleParagraph = {
  args: {
    contentBlocks: [
      {
        id: "block-1",
        type: "paragraph",
        text: "단일 문단으로 구성된 짧은 아티클입니다. 간결하고 핵심적인 내용만을 담아 독자의 시간을 존중합니다.",
      },
    ],
  },
};
