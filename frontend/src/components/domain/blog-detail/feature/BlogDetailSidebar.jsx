import BlogDetailActionRail from '@/components/domain/blog-detail/ui/BlogDetailActionRail';
import BlogDetailMetaAside from '@/components/domain/blog-detail/ui/BlogDetailMetaAside';

function hasMetaAsideContent({ asideNote, keywords, pageSignals, publishedAt, readTime, sections, updatedAt }) {
  return Boolean(
    asideNote || publishedAt || readTime || updatedAt || keywords?.length || pageSignals?.length || sections?.length,
  );
}

/**
 * 게시글 상세 화면의 사이드바 컴포넌트입니다.
 *
 * @param {Object} props
 * @param {number|string} [props.postId] - 게시글 ID
 * @param {string} [props.asideNote] - 사이드바 메모
 * @param {number} [props.bookmarks=7] - 즐겨찾기 수
 * @param {string[]} [props.keywords] - 키워드 목록
 * @param {number} [props.likes=18] - 좋아요 수
 * @param {Array} [props.pageSignals] - 페이지 신호 목록
 * @param {string} [props.publishedAt] - 발행일시
 * @param {string} [props.readTime] - 읽기 예상 시간
 * @param {Array} [props.sections] - 목차 섹션 목록
 * @param {string} [props.updatedAt] - 최종 수정일시
 */
export default function BlogDetailSidebar({
  postId,
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
      <BlogDetailActionRail postId={postId} bookmarks={bookmarks} likes={likes} />

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
