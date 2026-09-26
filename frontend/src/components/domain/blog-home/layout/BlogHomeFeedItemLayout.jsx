import Link from 'next/link';

import BlogHomeFeedItemContentLayout from '@/components/domain/blog-home/layout/BlogHomeFeedItemContentLayout';
import BlogHomeFeedItemFooterLayout from '@/components/domain/blog-home/layout/BlogHomeFeedItemFooterLayout';
import BlogHomeFeedItemThumbnailLayout from '@/components/domain/blog-home/layout/BlogHomeFeedItemThumbnailLayout';
import { cn } from '@/lib/utils';

/**
 * 블로그 홈 피드의 게시글 카드다. href 가 있으면 카드 전체가 상세 페이지 링크가 된다.
 *
 * @param {Object} props
 * @param {boolean} [props.isLikeDisabled=false] 좋아요 토글을 막을지 여부
 * @param {() => void} [props.onLikeToggle] 좋아요 버튼 클릭 처리기
 */
export default function BlogHomeFeedItemLayout({
  bookmarks = 0,
  category,
  className,
  comments = 0,
  date,
  excerpt,
  href,
  isLikeDisabled = false,
  isLiked = false,
  isLast = false,
  isPrivate = false,
  likes = 0,
  onLikeToggle,
  tags = [],
  thumbnailUrl,
  title,
}) {
  const hasThumbnail = Boolean(thumbnailUrl);

  return (
    <article
      className={cn(
        'relative px-5 py-6 md:px-6 md:py-7',
        !isLast ? 'border-b border-border' : '',
        isPrivate ? 'opacity-[0.85]' : '',
        // href 가 있으면 카드 전체가 클릭 가능함을 보여준다.
        href ? 'transition-colors hover:bg-muted/40' : '',
        className,
      )}
    >
      {href ? (
        // 링크 안에 버튼을 넣을 수 없어 카드 전체를 덮는 링크를 형제로 두고,
        // 반응 버튼이 있는 푸터만 링크 위로 올려 클릭이 상세 이동으로 새지 않게 한다.
        <Link
          href={href}
          aria-label={title}
          className="absolute inset-0 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        />
      ) : null}
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
          <div className="relative z-10">
            <BlogHomeFeedItemFooterLayout
              bookmarks={bookmarks}
              comments={comments}
              date={date}
              isLikeDisabled={isLikeDisabled}
              isLiked={isLiked}
              likes={likes}
              onLikeToggle={onLikeToggle}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
