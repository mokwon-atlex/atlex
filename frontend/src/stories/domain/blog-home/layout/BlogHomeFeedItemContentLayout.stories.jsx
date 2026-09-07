import BlogHomeFeedItemContentLayout from "@/components/domain/blog-home/layout/BlogHomeFeedItemContentLayout";

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogHomeFeedItemContentLayout> } */
const meta = {
  title: "Domain/BlogHome/Layout/BlogHomeFeedItemContentLayout",
  component: BlogHomeFeedItemContentLayout,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    isPrivate: { control: "boolean" },
    category: { control: "text" },
    title: { control: "text" },
    excerpt: { control: "text" },
    feedLabel: { control: "text" },
  },
};

export default meta;

export const Default = {
  args: {
    category: "Public",
    title: "게시글의 제목 | 게시글의 제목 | 게시글의 제목 | 게시글의 제목",
    excerpt:
      "본문 내용 | 본문 내용 | 본문 내용 | 본문 내용 | 본문 내용 | 본문 내용 | 본문 내용 | 본문 내용",
    tags: ["태그 1", "태그 2", "태그 3"],
    isPrivate: false,
    feedLabel: "Static Feed",
  },
};

export const Private = {
  args: {
    category: "Private",
    title: "비공개 게시글의 제목",
    excerpt: "이 글은 비공개 상태입니다.",
    tags: ["태그 8", "태그 9"],
    isPrivate: true,
  },
};

export const NoTags = {
  args: {
    category: "Public",
    title: "태그 없는 게시글",
    excerpt: "태그가 없는 게시글입니다.",
    tags: [],
    isPrivate: false,
  },
};

export const LongTitle = {
  render: () => (
    <div className="max-w-xl">
      <BlogHomeFeedItemContentLayout
        category="Public"
        title="매우 긴 제목의 게시글입니다. 이 제목은 두 줄을 초과할 수도 있어서 클램프 처리가 되어야 합니다. 계속해서 긴 제목을 작성해 봅니다."
        excerpt="본문 내용입니다."
        tags={["React", "TypeScript"]}
        isPrivate={false}
      />
    </div>
  ),
};

export const ManyTags = {
  args: {
    category: "Public",
    title: "태그가 많은 게시글",
    excerpt: "많은 태그를 가진 게시글입니다.",
    tags: ["React", "TypeScript", "Next.js", "TailwindCSS", "Storybook", "Jest"],
    isPrivate: false,
  },
};
