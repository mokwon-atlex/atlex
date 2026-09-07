import BlogDetailArticle from "@/components/domain/blog-detail/ui/BlogDetailArticle";
import BlogDetailAuthorCard from "@/components/domain/blog-detail/ui/BlogDetailAuthorCard";
import BlogDetailHero from "@/components/domain/blog-detail/ui/BlogDetailHero";

export default function BlogDetailContent({
  adminActions,
  authorCard,
  authorUserId,
  category,
  contentBlocks,
  excerpt,
  publishedAt,
  readTime,
  title,
  updatedAt,
  visibilityLabel,
}) {
  return (
    <div className="mx-auto w-full max-w-[820px] space-y-12">
      <BlogDetailHero
        adminActions={adminActions}
        authorUserId={authorUserId}
        category={category}
        excerpt={excerpt}
        publishedAt={publishedAt}
        readTime={readTime}
        title={title}
        updatedAt={updatedAt}
        visibilityLabel={visibilityLabel}
      />

      <BlogDetailArticle contentBlocks={contentBlocks ?? []} />

      {authorCard ? <BlogDetailAuthorCard authorCard={authorCard} /> : null}
    </div>
  );
}
