import { CardTitle } from '@/components/common/ui/card';
import BlogHomeSidebarCard from '@/components/domain/blog-home/layout/BlogHomeSidebarCard';
import BlogHomeTagChip from '@/components/domain/blog-home/ui/BlogHomeTagChip';

const defaultTitle = '태그';

export default function BlogHomeSidebarTagsLayout({ onTagSelect, tags = [], title = defaultTitle }) {
  const hasRealTags = tags.some((tag) => tag.id !== 'all');
  if (!hasRealTags) {
    return null;
  }

  return (
    <BlogHomeSidebarCard>
      <CardTitle className="text-base font-bold">{title}</CardTitle>

      <div className="mt-3.5 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <BlogHomeTagChip
            key={tag.id}
            active={tag.active}
            count={tag.count}
            label={tag.label}
            onClick={() => onTagSelect?.(tag.id)}
          />
        ))}
      </div>
    </BlogHomeSidebarCard>
  );
}
