import BlogHomeSidebarProfileLayout from "@/components/domain/blog-home/layout/BlogHomeSidebarProfileLayout";

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

const summaryStats = mockProfile.stats.filter((stat) => stat.id !== "posts");

/** @type { import('@storybook/nextjs-vite').Meta<typeof BlogHomeSidebarProfileLayout> } */
const meta = {
  title: "Domain/BlogHome/Layout/BlogHomeSidebarProfileLayout",
  component: BlogHomeSidebarProfileLayout,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

export const Default = {
  render: () => (
    <div className="w-72">
      <BlogHomeSidebarProfileLayout
        profile={mockProfile}
        summaryStats={summaryStats}
      />
    </div>
  ),
};

export const NoStats = {
  render: () => (
    <div className="w-72">
      <BlogHomeSidebarProfileLayout
        profile={mockProfile}
        summaryStats={[]}
      />
    </div>
  ),
};

export const LongBio = {
  render: () => (
    <div className="w-72">
      <BlogHomeSidebarProfileLayout
        profile={{
          ...mockProfile,
          bio: "안녕하세요! 저는 프론트엔드 개발자이며, React와 TypeScript를 주로 사용합니다. 새로운 기술을 배우고 공유하는 것을 좋아합니다.",
        }}
        summaryStats={summaryStats}
      />
    </div>
  ),
};

export const HighFollowers = {
  render: () => (
    <div className="w-72">
      <BlogHomeSidebarProfileLayout
        profile={mockProfile}
        summaryStats={[
          { id: "followers", label: "팔로워", value: "12,400" },
          { id: "following", label: "팔로잉", value: "320" },
        ]}
      />
    </div>
  ),
};
