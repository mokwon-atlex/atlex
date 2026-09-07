import { Card } from "@/components/common/ui/card";
import { Textfield, textfieldVariants } from "@/components/common/ui/textfield";
import { cn } from "@/lib/utils";
import BlogHomeFeedItemLayout from "@/components/domain/blog-home/layout/BlogHomeFeedItemLayout";
import BlogHomePagination from "@/components/domain/blog-home/ui/BlogHomePagination";
import { blogHomeFeedCopy } from "@/data/blog-home/blog-home-copy";

export default function BlogHomeFeed({ feed }) {
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
        <h2
          className={cn(
            textfieldVariants({ size: "xl", weight: "bold" }),
            "text-3xl tracking-tight"
          )}
        >
          {title} <span className="text-primary">{totalCount}</span>
        </h2>
      </div>

      {hasPosts ? (
        <Card
          className={cn(
            "overflow-hidden rounded-3xl gap-0 border-border bg-card/40 py-0 shadow-none",
            isLoading && "opacity-60"
          )}
        >
          {posts.map((post, index) => (
            <BlogHomeFeedItemLayout
              key={post.id}
              {...post}
              isLast={index === posts.length - 1}
            />
          ))}
        </Card>
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
