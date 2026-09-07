import BlogDetailSidebar from "@/components/domain/blog-detail/feature/BlogDetailSidebar";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogDetailSidebar> } */
const meta = {
  title: "Domain/BlogDetail/Feature/BlogDetailSidebar",
  component: BlogDetailSidebar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    likes: { control: "number" },
    bookmarks: { control: "number" },
  },
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

const mockKeywords = ["React", "컴포넌트", "디자인 시스템", "Atomic Design", "Tailwind CSS"];

export const Default = {
  render: () => (
    <div className="w-[280px]">
      <BlogDetailSidebar
        likes={18}
        bookmarks={7}
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

export const ActionRailOnly = {
  args: {
    likes: 42,
    bookmarks: 13,
  },
};

export const WithReadingMapAndInfo = {
  render: () => (
    <div className="w-[280px]">
      <BlogDetailSidebar
        likes={25}
        bookmarks={9}
        sections={mockSections}
        pageSignals={[]}
        publishedAt="2025년 4월 3일"
        updatedAt="2025년 4월 15일"
        readTime="12분"
        keywords={[]}
        asideNote=""
      />
    </div>
  ),
};

export const WithSignalsOnly = {
  render: () => (
    <div className="w-[280px]">
      <BlogDetailSidebar
        likes={8}
        bookmarks={3}
        sections={[]}
        pageSignals={mockPageSignals}
        publishedAt=""
        updatedAt=""
        readTime=""
        keywords={mockKeywords}
        asideNote="Next.js 14 App Router 기준으로 작성된 내용입니다."
      />
    </div>
  ),
};
