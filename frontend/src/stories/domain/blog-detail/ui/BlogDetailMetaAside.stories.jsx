import BlogDetailMetaAside from "@/components/domain/blog-detail/ui/BlogDetailMetaAside";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogDetailMetaAside> } */
const meta = {
  title: "Domain/BlogDetail/UI/BlogDetailMetaAside",
  component: BlogDetailMetaAside,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

const mockSections = [
  { id: "intro", eyebrow: "01", heading: "컴포넌트 설계 원칙" },
  { id: "atomic", eyebrow: "02", heading: "Atomic Design 방법론" },
  { id: "tokens", eyebrow: "03", heading: "디자인 토큰 활용" },
  { id: "patterns", eyebrow: "04", heading: "재사용 패턴 구현" },
  { id: "conclusion", eyebrow: "05", heading: "마치며" },
];

const mockPageSignals = [
  { label: "완독률", meter: 72, value: "72%" },
  { label: "공유 전환율", meter: 34, value: "34%" },
  { label: "북마크율", meter: 58, value: "58%" },
];

const mockKeywords = [
  "React",
  "컴포넌트",
  "디자인 시스템",
  "Atomic Design",
  "Tailwind CSS",
];

export const Default = {
  args: {
    sections: mockSections,
    pageSignals: mockPageSignals,
    publishedAt: "2025년 5월 12일",
    updatedAt: "2025년 5월 20일",
    readTime: "8분",
    keywords: mockKeywords,
    asideNote:
      "이 글은 실무에서 디자인 시스템을 구축한 경험을 바탕으로 작성되었습니다. 이론보다는 실전 적용 사례 중심으로 설명합니다.",
  },
};

export const ReadingMapOnly = {
  args: {
    sections: mockSections,
    pageSignals: [],
    keywords: [],
    asideNote: "",
    publishedAt: "",
    updatedAt: "",
    readTime: "",
  },
};

export const PostInfoOnly = {
  args: {
    sections: [],
    pageSignals: [],
    publishedAt: "2025년 4월 3일",
    updatedAt: "2025년 4월 15일",
    readTime: "12분",
    keywords: [],
    asideNote: "",
  },
};

export const WithSignalsAndKeywords = {
  args: {
    sections: [],
    pageSignals: mockPageSignals,
    publishedAt: "2025년 3월 20일",
    updatedAt: "",
    readTime: "6분",
    keywords: mockKeywords,
    asideNote: "Next.js 14 App Router 기준으로 작성된 내용입니다.",
  },
};

export const Full = {
  render: () => (
    <div className="w-[280px]">
      <BlogDetailMetaAside
        sections={mockSections}
        pageSignals={mockPageSignals}
        publishedAt="2025년 5월 12일"
        updatedAt="2025년 5월 20일"
        readTime="8분"
        keywords={mockKeywords}
        asideNote="이 글은 실무에서 디자인 시스템을 구축한 경험을 바탕으로 작성되었습니다."
      />
    </div>
  ),
};
