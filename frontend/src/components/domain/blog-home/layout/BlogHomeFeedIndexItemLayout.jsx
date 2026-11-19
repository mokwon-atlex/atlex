import Link from 'next/link';

import { cn } from '@/lib/utils';

/**
 * 미니멀 스킨의 제목 목록 한 줄이다. 제목과 날짜만 보여 주고, href 가 있으면 줄 전체가 상세 링크가 된다.
 *
 * @param {Object} props
 * @param {string} [props.category] 카테고리 이름
 * @param {string} props.date 'YYYY.MM.DD' 형식 작성일
 * @param {string | null} [props.href] 상세 페이지 경로
 * @param {boolean} [props.isPrivate=false] 비공개 글 여부
 * @param {string} props.title 글 제목
 */
export default function BlogHomeFeedIndexItemLayout({ category, date = '', href, isPrivate = false, title }) {
  const content = (
    <>
      <span className="min-w-0 flex-1">
        <span className="font-semibold text-foreground [word-break:keep-all] group-hover:text-primary">{title}</span>
        {category ? <span className="ml-2 text-xs text-muted-foreground">{category}</span> : null}
        {isPrivate ? <span className="ml-2 text-xs text-muted-foreground">비공개</span> : null}
      </span>
      <time className="shrink-0 text-xs tabular-nums text-muted-foreground">{date.slice(5)}</time>
    </>
  );
  const className = cn(
    'group flex items-baseline gap-4 border-b border-dashed border-border py-3 transition-colors',
    href ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring' : '',
  );

  return (
    <li>
      {href ? (
        <Link href={href} className={className}>
          {content}
        </Link>
      ) : (
        <div className={className}>{content}</div>
      )}
    </li>
  );
}
