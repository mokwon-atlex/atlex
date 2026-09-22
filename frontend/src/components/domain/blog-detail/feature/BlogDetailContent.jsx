import BlogDetailArticle from '@/components/domain/blog-detail/ui/BlogDetailArticle';
import BlogDetailAuthorCard from '@/components/domain/blog-detail/ui/BlogDetailAuthorCard';
import BlogDetailHero from '@/components/domain/blog-detail/ui/BlogDetailHero';

/**
 * 게시글 상세 화면의 최상위 레이아웃. postId를 BlogDetailHero로 전달해
 * 작성자 전용 수정 링크(`/write/{postId}`)를 만들 수 있게 한다.
 *
 * @param {object} props
 * @param {string[]} [props.adminActions] - 작성자에게 노출할 액션 라벨 목록(예: ['통계', '수정', '삭제']).
 * @param {object} [props.authorCard] - 작성자 카드에 표시할 정보.
 * @param {string|number|null} [props.authorUserId] - 게시글 작성자 ID.
 * @param {string} [props.category] - 카테고리명.
 * @param {Array} [props.contentBlocks] - 본문을 구성하는 블록 목록.
 * @param {string} [props.excerpt] - 게시글 요약.
 * @param {string|number} [props.postId] - 게시글 ID. 수정 링크 생성에 사용된다.
 * @param {string} [props.publishedAt] - 게시일.
 * @param {string} [props.readTime] - 예상 읽기 시간.
 * @param {string} [props.title] - 제목.
 * @param {string} [props.updatedAt] - 수정일.
 * @param {string} [props.visibilityLabel] - 공개/비공개 라벨.
 * @returns {JSX.Element} 게시글 상세 콘텐츠 레이아웃.
 */
export default function BlogDetailContent({
  adminActions,
  authorCard,
  authorUserId,
  category,
  contentBlocks,
  excerpt,
  postId,
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
        postId={postId}
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
