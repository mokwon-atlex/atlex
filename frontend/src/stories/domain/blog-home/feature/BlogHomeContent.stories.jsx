import BlogHomeContent from "@/components/domain/blog-home/feature/BlogHomeContent";

const mockProfile = {
  userId: "userId",
  nickname: "닉네임",
  bio: "그냥 대충 소개글 적는 곳",
  stats: [
    { id: "followers", label: "팔로워", value: "120" },
    { id: "following", label: "팔로잉", value: "85" },
    { id: "posts", label: "게시글", value: "38" },
  ],
  quickActions: [
    { id: "follow", label: "팔로우" },
    { id: "category", label: "카테고리" },
    { id: "graph", label: "그래프 보기" },
  ],
};

const mockTags = [
  { id: "all", label: "전체 글", count: 78, active: true },
  { id: "tag-1", label: "태그 1", count: 12 },
  { id: "tag-2", label: "태그 2", count: 9 },
  { id: "tag-3", label: "태그 3", count: 8 },
  { id: "tag-4", label: "태그 4", count: 6 },
];

const mockFeed = {
  totalCount: 38,
  title: "전체 글",
  eyebrowLabel: "Archive",
  posts: [
    {
      id: 1,
      category: "Public",
      title: "게시글의 제목 | 게시글의 제목 | 게시글의 제목 | 게시글의 제목",
      excerpt:
        "본문 내용 | 본문 내용 | 본문 내용 | 본문 내용 | 본문 내용 | 본문 내용 | 본문 내용",
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
      isLiked: false,
    },
    {
      id: 3,
      category: "Private",
      title: "비공개 게시글의 제목",
      excerpt: "본문 내용 | 본문 내용 | 본문 내용 | 본문 내용 | 본문 내용",
      tags: ["태그 8", "태그 9"],
      date: "2026.01.23",
      likes: 0,
      comments: 0,
      bookmarks: 0,
      isPrivate: true,
    },
  ],
  pagination: [
    { id: "page-1", label: "1" },
    { id: "page-2", label: "2", current: true },
    { id: "page-3", label: "3" },
  ],
};

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogHomeContent> } */
const meta = {
  title: "Domain/BlogHome/Feature/BlogHomeContent",
  component: BlogHomeContent,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;

export const Default = {
  render: () => (
    <div className="p-6">
      <BlogHomeContent
        feed={mockFeed}
        profile={mockProfile}
        tags={mockTags}
      />
    </div>
  ),
};

export const TagPreselected = {
  render: () => (
    <div className="p-6">
      <BlogHomeContent
        feed={{ ...mockFeed, title: "태그 1", totalCount: 12 }}
        profile={mockProfile}
        tags={[
          { id: "all", label: "전체 글", count: 78 },
          { id: "tag-1", label: "태그 1", count: 12, active: true },
          { id: "tag-2", label: "태그 2", count: 9 },
          { id: "tag-3", label: "태그 3", count: 8 },
        ]}
      />
    </div>
  ),
};

export const EmptyFeed = {
  render: () => (
    <div className="p-6">
      <BlogHomeContent
        feed={{ ...mockFeed, posts: [], pagination: [], totalCount: 0, title: "태그 999" }}
        profile={mockProfile}
        tags={mockTags}
      />
    </div>
  ),
};
