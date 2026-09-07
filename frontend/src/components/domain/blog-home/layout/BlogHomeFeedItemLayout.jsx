import Link from 'next/link';

import BlogHomeFeedItemContentLayout from '@/components/domain/blog-home/layout/BlogHomeFeedItemContentLayout';
import BlogHomeFeedItemFooterLayout from '@/components/domain/blog-home/layout/BlogHomeFeedItemFooterLayout';
import BlogHomeFeedItemThumbnailLayout from '@/components/domain/blog-home/layout/BlogHomeFeedItemThumbnailLayout';
import { cn } from '@/lib/utils';

export default function BlogHomeFeedItemLayout({
  bookmarks = 0,
  category,
  className,
  comments = 0,
  date,
  excerpt,
  href,
  isLiked = false,
  isLast = false,
  isPrivate = false,
  likes = 0,
  tags = [],
  thumbnailUrl,
  title,
}) {
  const hasThumbnail = Boolean(thumbnailUrl);

  const body = (
    <div
      className={cn(
        'flex flex-col gap-5',
        hasThumbnail ? 'lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-6' : '',
      )}
    >
      <BlogHomeFeedItemThumbnailLayout thumbnailUrl={thumbnailUrl} />

      <div className="min-w-0 flex flex-1 flex-col">
        <BlogHomeFeedItemContentLayout
          category={category}
          excerpt={excerpt}
          isPrivate={isPrivate}
          tags={tags}
          title={title}
        />
        <BlogHomeFeedItemFooterLayout
          bookmarks={bookmarks}
          comments={comments}
          date={date}
          isLiked={isLiked}
          likes={likes}
        />
      </div>
    </div>
  );

  return (
    <article
      className={cn(
        'px-5 py-6 md:px-6 md:py-7',
        !isLast ? 'border-b border-border' : '',
        isPrivate ? 'opacity-[0.85]' : '',
        // href 가 있으면 카드 전체가 클릭 가능함을 보여준다.
        href ? 'transition-colors hover:bg-muted/40' : '',
        className,
      )}
    >
      {href ? (
        // 카드 전체를 상세 페이지 링크로 감싼다.
        <Link href={href} className="block">
          {body}
        </Link>
      ) : (
        body
      )}
    </article>
  );
}
