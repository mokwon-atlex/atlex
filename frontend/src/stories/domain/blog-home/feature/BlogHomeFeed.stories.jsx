import BlogHomeFeed from "@/components/domain/blog-home/feature/BlogHomeFeed";

const mockPosts = [
  {
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
    thumbnailUrl: "https://placehold.co/600x400?text=IMG",
  },
  {
    id: 2,
    category: "Public",
    title: "게시글의 제목",
    excerpt: "본문 내용 | 본문 내용 | 본문 내용 | 본문 내용",
    tags: ["태그 4", "태그 5"],
    date: "2026.02.29",
    likes: 14,
    comments: 6,
    bookmarks: 2,
    isLiked: true,
  },
  {
    id: 3,
    category: "Private",
    title: "비공개 게시글의 제목",
    excerpt:
      "본문 내용 | 본문 내용 | 본문 내용 | 본문 내용 | 본문 내용 | 본문 내용",
    tags: ["태그 8", "태그 9"],
    date: "2026.01.23",
    likes: 0,
    comments: 0,
    bookmarks: 0,
    isPrivate: true,
  },
];

const mockPagination = [
  { id: "page-1", label: "1" },
  { id: "page-2", label: "2", current: true },
  { id: "page-3", label: "3" },
  { id: "page-4", label: "4" },
  { id: "page-5", label: "5" },
];

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogHomeFeed> } */
const meta = {
  title: "Domain/BlogHome/Feature/BlogHomeFeed",
  component: BlogHomeFeed,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

export const Default = {
  render: () => (
    <div className="w-[700px]">
      <BlogHomeFeed
        feed={{
          posts: mockPosts,
          pagination: mockPagination,
          totalCount: 38,
          title: "전체 글",
          eyebrowLabel: "Archive",
        }}
      />
    </div>
  ),
};

export const FilteredByTag = {
  render: () => (
    <div className="w-[700px]">
      <BlogHomeFeed
        feed={{
          posts: mockPosts.slice(0, 1),
          pagination: [],
          totalCount: 1,
          title: "태그 1",
          eyebrowLabel: "Archive",
        }}
      />
    </div>
  ),
};

export const EmptyState = {
  render: () => (
    <div className="w-[700px]">
      <BlogHomeFeed
        feed={{
          posts: [],
          pagination: [],
          totalCount: 0,
          title: "태그 999",
          eyebrowLabel: "Archive",
        }}
      />
    </div>
  ),
};

export const NoPagination = {
  render: () => (
    <div className="w-[700px]">
      <BlogHomeFeed
        feed={{
          posts: mockPosts,
          pagination: [],
          totalCount: mockPosts.length,
          title: "전체 글",
          eyebrowLabel: "Archive",
        }}
      />
    </div>
  ),
};
