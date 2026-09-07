import BlogHomeFeedItemLayout from "@/components/domain/blog-home/layout/BlogHomeFeedItemLayout";

const mockPost = {
  id: 1,
  category: "Public",
  title: "게시글의 제목 | 게시글의 제목 | 게시글의 제목 | 게시글의 제목",
  excerpt:
    "본문 내용 | 본문 내용 | 본문 내용 | 본문 내용 | 본문 내용 | 본문 내용 | 본문 내용 | 본문 내용 | 본문 내용 | 본문 내용",
  tags: ["태그 1", "태그 2", "태그 3"],
  date: "2026.03.23",
  likes: 24,
  comments: 8,
  bookmarks: 2,
  isLiked: true,
};

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogHomeFeedItemLayout> } */
const meta = {
  title: "Domain/BlogHome/Layout/BlogHomeFeedItemLayout",
  component: BlogHomeFeedItemLayout,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    isLiked: { control: "boolean" },
    isLast: { control: "boolean" },
    isPrivate: { control: "boolean" },
    likes: { control: "number" },
    comments: { control: "number" },
    bookmarks: { control: "number" },
  },
};

export default meta;

export const Default = {
  render: () => (
    <div className="max-w-2xl rounded-3xl border border-border overflow-hidden">
      <BlogHomeFeedItemLayout {...mockPost} isLast />
    </div>
  ),
};

export const WithThumbnail = {
  render: () => (
    <div className="max-w-2xl rounded-3xl border border-border overflow-hidden">
      <BlogHomeFeedItemLayout
        {...mockPost}
        thumbnailUrl="https://placehold.co/600x400?text=IMG"
        isLast
      />
    </div>
  ),
};

export const Private = {
  render: () => (
    <div className="max-w-2xl rounded-3xl border border-border overflow-hidden">
      <BlogHomeFeedItemLayout
        {...mockPost}
        category="Private"
        title="비공개 게시글의 제목"
        isPrivate
        isLiked={false}
        likes={0}
        comments={0}
        bookmarks={0}
        isLast
      />
    </div>
  ),
};

export const NotLast = {
  render: () => (
    <div className="max-w-2xl rounded-3xl border border-border overflow-hidden">
      <BlogHomeFeedItemLayout {...mockPost} isLast={false} />
      <BlogHomeFeedItemLayout
        {...mockPost}
        id={2}
        title="두 번째 게시글"
        isLast
      />
    </div>
  ),
};

export const Liked = {
  render: () => (
    <div className="max-w-2xl rounded-3xl border border-border overflow-hidden">
      <BlogHomeFeedItemLayout {...mockPost} isLiked={true} likes={25} isLast />
    </div>
  ),
};
