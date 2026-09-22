import { Capsule } from '@/components/common/ui/capsule';
import { textfieldVariants } from '@/components/common/ui/textfield';
import { AdminActions } from '@/components/domain/blog-detail/ui/AdminActions';

function MetaItem({ children }) {
  return <span className="text-[0.95rem] text-muted-foreground">{children}</span>;
}

/**
 * 블로그 게시글 상세 상단 영역(카테고리, 제목, 요약, 발행일자 및 관리자 액션)을 렌더링합니다.
 *
 * @param {object} props
 * @param {string[]} [props.adminActions] - 관리자 액션 목록
 * @param {string} [props.authorUserId] - 작성자 유저 ID
 * @param {string} [props.category] - 카테고리명
 * @param {string} [props.excerpt] - 게시글 요약문
 * @param {string | number} [props.postId] - 게시글 ID
 * @param {string} [props.publishedAt] - 발행 일자 텍스트
 * @param {string} [props.readTime] - 예상 읽기 시간 텍스트
 * @param {string} [props.title] - 게시글 제목
 * @param {string} [props.updatedAt] - 수정 일자 텍스트
 * @param {string} [props.visibilityLabel] - 공개 여부 라벨
 */
export default function BlogDetailHero({
  adminActions,
  authorUserId,
  category,
  excerpt,
  postId,
  publishedAt,
  readTime,
  title,
  updatedAt,
  visibilityLabel,
}) {
  return (
    <section className="space-y-8 border-b border-border pb-10">
      <div className="space-y-5">
        <Capsule variant="outline" className="text-[0.68rem] tracking-[0.24em] uppercase">
          {category}
        </Capsule>

        <h1
          className={textfieldVariants({
            whitespace: 'keep',
            className: 'text-[clamp(2.5rem,5vw,4.4rem)] font-bold leading-[1] tracking-[-0.11em] text-foreground',
          })}
        >
          {title}
        </h1>

        <p
          className={textfieldVariants({
            whitespace: 'keep',
            className: 'max-w-[40rem] text-[1rem] leading-8 text-foreground/76 sm:text-[1.06rem]',
          })}
        >
          {excerpt}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <MetaItem>{publishedAt}</MetaItem>
            <span className="text-muted-foreground">/</span>
            <MetaItem>{readTime}</MetaItem>
            <Capsule variant="outline" size="sm" className="rounded-md">
              {visibilityLabel}
            </Capsule>
          </div>

          <AdminActions authorUserId={authorUserId} postId={postId} actions={adminActions} />
        </div>
      </div>
    </section>
  );
}
