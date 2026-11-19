import BlogHomeSidebarProfileLayout from '@/components/domain/blog-home/layout/BlogHomeSidebarProfileLayout';
import BlogHomeSidebarSproutLayout from '@/components/domain/blog-home/layout/BlogHomeSidebarSproutLayout';
import BlogHomeSidebarTagsLayout from '@/components/domain/blog-home/layout/BlogHomeSidebarTagsLayout';
import { cn } from '@/lib/utils';

/**
 * 블로그 홈의 프로필·태그 영역이다.
 *
 * @param {Object} props
 * @param {'column' | 'row'} [props.orientation='column'] row 는 넓은 화면에서 프로필과 태그를 가로로 나란히 놓는다(매거진 스킨 하단)
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
