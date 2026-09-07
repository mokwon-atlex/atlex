import BlogMainPostCard from "@/components/domain/blog-main/ui/BlogMainPostCard";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogMainPostCard> } */
const meta = {
  title: "Domain/BlogMain/UI/BlogMainPostCard",
  component: BlogMainPostCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    post: { control: "object" },
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

const mockPost = {
  id: 1,
  title: "Tailwind CSS로 반응형 레이아웃 설계하기",
  excerpt: "다양한 화면 크기에서 일관성 있는 레이아웃을 유지하는 방법을 알아봅니다.",
  eyebrow: "UI 실험",
  publishedAt: "2024-05-10",
  comments: 5,
  author: "siho",
  likes: 42,
  cover: {
    variant: "stack",
    tone: "blue",
    size: "medium",
    main: "Layout",
    caption: "DESIGN",
  },
};

export const Default = {
  args: { post: mockPost },
};

export const WithOrbitCover = {
  args: {
    post: {
      ...mockPost,
      id: 2,
      title: "인터랙션 디자인 원칙",
      excerpt: "사용자 경험을 극대화하는 인터랙션 패턴을 살펴봅니다.",
      cover: {
        variant: "orbit",
        tone: "cyan",
        size: "medium",
        main: "UX",
        caption: "INTERACTION",
      },
    },
  },
};

export const WithPosterCover = {
  args: {
    post: {
      ...mockPost,
      id: 3,
      title: "릴리즈 노트 v2.0",
      excerpt: "새로운 기능과 개선사항을 정리한 릴리즈 노트입니다.",
      eyebrow: null,
      cover: {
        variant: "poster",
        tone: "slate",
        size: "medium",
        main: "v2.0",
        caption: "RELEASE",
        symbol: "R",
      },
    },
  },
};

export const WithMinimalCover = {
  args: {
    post: {
      ...mockPost,
      id: 4,
      title: "주간 회고 #12",
      excerpt: "이번 주에 진행한 작업과 배운 점들을 회고합니다.",
      eyebrow: "주간 회고",
      cover: {
        variant: "minimal",
        tone: "cream",
        size: "small",
        main: "#12",
      },
    },
  },
};

export const NoCover = {
  args: {
    post: {
      ...mockPost,
      id: 5,
      title: "커버 없는 게시물 예시",
      excerpt: "커버 이미지 없이 텍스트만으로 구성된 카드 형태입니다.",
      cover: { variant: "none" },
    },
  },
};

export const NoEyebrow = {
  args: {
    post: {
      ...mockPost,
      eyebrow: null,
    },
  },
};
