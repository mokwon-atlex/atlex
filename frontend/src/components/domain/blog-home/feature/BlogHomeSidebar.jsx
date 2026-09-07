import BlogHomeSidebarProfileLayout from "@/components/domain/blog-home/layout/BlogHomeSidebarProfileLayout";
import BlogHomeSidebarTagsLayout from "@/components/domain/blog-home/layout/BlogHomeSidebarTagsLayout";

export default function BlogHomeSidebar({
  onTagSelect,
  profile,
  quickActionOverrides,
  tags,
}) {
  const summaryStats =
    profile?.stats?.filter((stat) => stat.id !== "posts") ?? [];

  return (
    <aside className="space-y-4">
      <BlogHomeSidebarProfileLayout
        profile={profile}
        quickActionOverrides={quickActionOverrides}
        summaryStats={summaryStats}
      />
      <BlogHomeSidebarTagsLayout onTagSelect={onTagSelect} tags={tags} />
    </aside>
  );
}
