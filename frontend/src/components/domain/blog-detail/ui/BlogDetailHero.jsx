import { Capsule } from '@/components/common/ui/capsule';
import { textfieldVariants } from '@/components/common/ui/textfield';
import { AdminActions } from '@/components/domain/blog-detail/ui/AdminActions';

function MetaItem({ children }) {
  return <span className="text-[0.95rem] text-muted-foreground">{children}</span>;
}

/**
 * 게시글 상세 상단 영역(제목·요약·메타 정보). postId를 AdminActions로 전달해
 * 작성자 전용 수정 버튼의 이동 경로(`/write/{postId}`)를 만들 수 있게 한다.
 *
 * @param {object} props
 * @param {string[]} [props.adminActions] - 작성자에게 노출할 액션 라벨 목록.
 * @param {string|number|null} [props.authorUserId] - 게시글 작성자 ID(작성자 여부 판단에 사용).
 * @param {string} [props.category] - 카테고리명.
 * @param {string} [props.excerpt] - 게시글 요약.
 * @param {string|number} [props.postId] - 게시글 ID. AdminActions의 수정 링크 생성에 사용된다.
 * @param {string} [props.publishedAt] - 게시일.
 * @param {string} [props.readTime] - 예상 읽기 시간.
 * @param {string} [props.title] - 제목.
 * @param {string} [props.updatedAt] - 수정일.
 * @param {string} [props.visibilityLabel] - 공개/비공개 라벨.
 * @returns {JSX.Element} 게시글 상세 상단 영역.
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

          <AdminActions authorUserId={authorUserId} actions={adminActions} postId={postId} />
        </div>
      </div>
    </section>
  );
}
