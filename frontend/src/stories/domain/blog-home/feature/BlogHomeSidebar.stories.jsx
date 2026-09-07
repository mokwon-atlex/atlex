import BlogHomeSidebar from "@/components/domain/blog-home/feature/BlogHomeSidebar";

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
  { id: "tag-5", label: "태그 5", count: 5 },
];

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogHomeSidebar> } */
const meta = {
  title: "Domain/BlogHome/Feature/BlogHomeSidebar",
  component: BlogHomeSidebar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

export const Default = {
  render: () => (
    <div className="w-72">
      <BlogHomeSidebar
        profile={mockProfile}
        tags={mockTags}
        onTagSelect={(id) => console.log("tagSelected:", id)}
      />
    </div>
  ),
};

export const SecondTagActive = {
  render: () => (
    <div className="w-72">
      <BlogHomeSidebar
        profile={mockProfile}
        tags={[
          { id: "all", label: "전체 글", count: 78 },
          { id: "tag-1", label: "태그 1", count: 12, active: true },
          { id: "tag-2", label: "태그 2", count: 9 },
          { id: "tag-3", label: "태그 3", count: 8 },
        ]}
        onTagSelect={(id) => console.log("tagSelected:", id)}
      />
    </div>
  ),
};

export const ManyTags = {
  render: () => (
    <div className="w-72">
      <BlogHomeSidebar
        profile={mockProfile}
        tags={[
          { id: "all", label: "전체 글", count: 120, active: true },
          { id: "tag-1", label: "React", count: 34 },
          { id: "tag-2", label: "TypeScript", count: 28 },
          { id: "tag-3", label: "Next.js", count: 20 },
          { id: "tag-4", label: "CSS", count: 15 },
          { id: "tag-5", label: "JavaScript", count: 12 },
          { id: "tag-6", label: "TailwindCSS", count: 8 },
          { id: "tag-7", label: "Testing", count: 3 },
        ]}
        onTagSelect={(id) => console.log("tagSelected:", id)}
      />
    </div>
  ),
};
