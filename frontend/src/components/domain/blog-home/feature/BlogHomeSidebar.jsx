import BlogHomeSidebarProfileLayout from '@/components/domain/blog-home/layout/BlogHomeSidebarProfileLayout';
import BlogHomeSidebarSproutLayout from '@/components/domain/blog-home/layout/BlogHomeSidebarSproutLayout';
import BlogHomeSidebarTagsLayout from '@/components/domain/blog-home/layout/BlogHomeSidebarTagsLayout';
import { cn } from '@/lib/utils';

/**
 * 블로그 홈의 프로필·태그 영역이다.
 *
 * @param {Object} props
 * @param {'column' | 'row' | 'split'} [props.orientation='column'] split 은 미니멀 스킨 상단에서 프로필과 지식 화분을 좌우 반반으로 배치한다
 */
export default function BlogHomeSidebar({
  onStatClick,
  onTagSelect,
  orientation = 'column',
  profile,
  quickActionOverrides,
  tags,
}) {
  const summaryStats = profile?.stats?.filter((stat) => stat.id !== 'posts') ?? [];
  const rawPostCount = profile?.stats?.find((stat) => stat.id === 'posts')?.value ?? 0;
  const postCount = Number(String(rawPostCount).replace(/,/g, '')) || 0;

  if (orientation === 'split') {
    return (
      <aside className="grid items-stretch gap-4 md:grid-cols-2">
        <BlogHomeSidebarProfileLayout
          onStatClick={onStatClick}
          profile={profile}
          quickActionOverrides={quickActionOverrides}
          summaryStats={summaryStats}
        />
        <BlogHomeSidebarSproutLayout postCount={postCount} />
      </aside>
    );
  }

  return (
    <aside className={cn(orientation === 'row' ? 'grid items-start gap-4 lg:grid-cols-3' : 'space-y-4')}>
      <BlogHomeSidebarProfileLayout
        onStatClick={onStatClick}
        profile={profile}
        quickActionOverrides={quickActionOverrides}
        summaryStats={summaryStats}
      />
      <BlogHomeSidebarSproutLayout postCount={postCount} />
      <BlogHomeSidebarTagsLayout onTagSelect={onTagSelect} tags={tags} />
    </aside>
  );
}
