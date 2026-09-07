import BlogDetailActionRail from "@/components/domain/blog-detail/ui/BlogDetailActionRail";
import BlogDetailMetaAside from "@/components/domain/blog-detail/ui/BlogDetailMetaAside";

function hasMetaAsideContent({
  asideNote,
  keywords,
  pageSignals,
  publishedAt,
  readTime,
  sections,
  updatedAt,
}) {
  return Boolean(
    asideNote ||
      publishedAt ||
      readTime ||
      updatedAt ||
      keywords?.length ||
      pageSignals?.length ||
      sections?.length
  );
}

export default function BlogDetailSidebar({
  asideNote,
  bookmarks = 7,
  keywords,
  likes = 18,
  pageSignals,
  publishedAt,
  readTime,
  sections,
  updatedAt,
}) {
  const shouldRenderMetaAside = hasMetaAsideContent({
    asideNote,
    keywords,
    pageSignals,
    publishedAt,
    readTime,
    sections,
    updatedAt,
  });

  return (
    <aside className="flex flex-col items-end gap-6 xl:sticky xl:top-1/2 xl:-translate-y-1/2">
      <BlogDetailActionRail bookmarks={bookmarks} likes={likes} />

      {shouldRenderMetaAside ? (
        <BlogDetailMetaAside
          asideNote={asideNote}
          keywords={keywords ?? []}
          pageSignals={pageSignals ?? []}
          publishedAt={publishedAt}
          readTime={readTime}
          sections={sections ?? []}
          updatedAt={updatedAt}
        />
      ) : null}
    </aside>
  );
}
