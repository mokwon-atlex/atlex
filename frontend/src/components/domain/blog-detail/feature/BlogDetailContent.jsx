import BlogDetailArticle from '@/components/domain/blog-detail/ui/BlogDetailArticle';
import BlogDetailAuthorCard from '@/components/domain/blog-detail/ui/BlogDetailAuthorCard';
import BlogDetailHero from '@/components/domain/blog-detail/ui/BlogDetailHero';

/**
 * 블로그 상세 본문 레이아웃(헤더 히어로, 아티클 본문, 작성자 프로필 카드)을 구성합니다.
 *
 * @param {object} props
 * @param {string[]} [props.adminActions] - 관리자 액션 목록
 * @param {object} [props.authorCard] - 작성자 카드 데이터
 * @param {string} [props.authorUserId] - 작성자 유저 ID
 * @param {string} [props.category] - 카테고리명
 * @param {Array} [props.contentBlocks] - 본문 블록 목록
 * @param {string} [props.excerpt] - 요약문
 * @param {string | number} [props.postId] - 게시글 ID
 * @param {string} [props.publishedAt] - 발행일시
 * @param {string} [props.readTime] - 읽기 소요 시간
 * @param {string} [props.title] - 제목
 * @param {string} [props.updatedAt] - 수정일시
 * @param {string} [props.visibilityLabel] - 공개 상태
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
