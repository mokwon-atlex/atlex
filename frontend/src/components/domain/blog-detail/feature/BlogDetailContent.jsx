import BlogDetailArticle from '@/components/domain/blog-detail/ui/BlogDetailArticle';
import BlogDetailAuthorCard from '@/components/domain/blog-detail/ui/BlogDetailAuthorCard';
import { BlogDetailComments } from '@/components/domain/blog-detail/ui/BlogDetailComments';
import BlogDetailHero from '@/components/domain/blog-detail/ui/BlogDetailHero';

export default function BlogDetailContent({
  adminActions,
  authorCard,
  authorUserId,
  category,
  contentBlocks,
  excerpt,
  id,
  postId,
  publishedAt,
  readTime,
  title,
  updatedAt,
  visibilityLabel,
}) {
  const currentPostId = postId ?? id;
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

      {currentPostId ? <BlogDetailComments postId={currentPostId} postAuthorUserId={authorUserId} /> : null}
    </div>
  );
}
