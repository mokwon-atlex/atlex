import { Card } from '@/components/common/ui/card';
import { Textfield, textfieldVariants } from '@/components/common/ui/textfield';
import { cn } from '@/lib/utils';
import BlogHomeFeedIndexItemLayout from '@/components/domain/blog-home/layout/BlogHomeFeedIndexItemLayout';
import BlogHomeFeedItemLayout from '@/components/domain/blog-home/layout/BlogHomeFeedItemLayout';
import BlogHomePagination from '@/components/domain/blog-home/ui/BlogHomePagination';
import { blogHomeFeedCopy } from '@/data/blog-home/blog-home-copy';

/** 글 목록을 연도별로 묶는다. 날짜는 'YYYY.MM.DD' 형식이다. */
function groupPostsByYear(posts) {
  const groups = new Map();

  posts.forEach((post) => {
    const year = post.date?.slice(0, 4) || '날짜 없음';

    if (!groups.has(year)) {
      groups.set(year, []);
    }
    groups.get(year).push(post);
  });

  return [...groups.entries()];
}

/** 스킨별 글 목록 형태. list 는 기본 카드 목록, magazine 은 대표 글 + 카드 그리드, index 는 연도별 제목 목록이다. */
function BlogHomeFeedPosts({ posts, variant }) {
  if (variant === 'magazine') {
    const [featuredPost, ...restPosts] = posts;

    return (
      <div className="space-y-4">
        <BlogHomeFeedItemLayout {...featuredPost} />
        {restPosts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {restPosts.map((post) => (
              <BlogHomeFeedItemLayout key={post.id} {...post} layout="stacked" />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (variant === 'index') {
    return (
      <div className="space-y-6">
        {groupPostsByYear(posts).map(([year, yearPosts]) => (
          <section key={year} aria-label={`${year}년 글`}>
            <h3 className="mb-1 text-sm font-bold tabular-nums text-muted-foreground">{year}</h3>
            <ul>
              {yearPosts.map((post) => (
                <BlogHomeFeedIndexItemLayout key={post.id} {...post} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <BlogHomeFeedItemLayout key={post.id} {...post} />
      ))}
    </div>
  );
}

export default function BlogHomeFeed({ feed, variant = 'list' }) {
  const {
    eyebrowLabel = blogHomeFeedCopy.eyebrowLabel,
    pagination = [],
    posts = [],
    title = blogHomeFeedCopy.defaultTitle,
    totalCount = posts.length,
  } = feed;
  const hasPosts = posts.length > 0;
  const isLoading = Boolean(feed.isLoading);

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <Textfield className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          {eyebrowLabel}
        </Textfield>
        <h2 className={cn(textfieldVariants({ size: 'xl', weight: 'bold' }), 'text-3xl tracking-tight')}>
          {title} <span className="text-primary">{totalCount}</span>
        </h2>
      </div>

      {hasPosts ? (
        <div className={cn(isLoading && 'opacity-60')}>
          <BlogHomeFeedPosts posts={posts} variant={variant} />
        </div>
      ) : (
        <Card className="overflow-hidden rounded-3xl gap-0 border-border bg-card/40 py-0 shadow-none">
          <div className="flex min-h-64 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
            <Textfield size="lg" weight="bold">
              {blogHomeFeedCopy.getEmptyStateTitle(title)}
            </Textfield>
            <Textfield variant="muted" size="sm">
              {blogHomeFeedCopy.emptyStateDescription}
            </Textfield>
          </div>
        </Card>
      )}

      {hasPosts && pagination.length > 0 ? (
        <BlogHomePagination
          currentPage={feed.page}
          isLoading={isLoading}
          items={pagination}
          onPageChange={feed.onPageChange}
          totalPages={feed.totalPages}
        />
      ) : null}
    </section>
  );
}
