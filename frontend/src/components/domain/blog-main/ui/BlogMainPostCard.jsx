import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/common/ui/card';
import { Textfield } from '@/components/common/ui/textfield';
import { postDetailHref, userBlogHref } from '@/lib/url/handle';
import BlogMainPostCover from './BlogMainPostCover';

export default function BlogMainPostCard({ post }) {
  const hasCover = !!(post.cover && post.cover.variant !== 'none');
  const detailHref = post.authorUserId ? postDetailHref(post.authorUserId, post.id) : null;
  const userHref = post.authorUserId ? userBlogHref(post.authorUserId) : null;

  const detailBody = (
    <>
      <BlogMainPostCover cover={post.cover} />

      {/* 본문 영역: flex column + min-height 로 카드 높이 베이스라인을 유지하고,
          날짜/댓글 푸터는 mt-auto 로 항상 하단에 고정한다. */}
      <CardContent className={`flex min-h-[8.5rem] flex-1 flex-col px-4 pb-3.5 ${hasCover ? 'pt-3.5' : 'pt-4'}`}>
        {/* 썸네일 없는 카드는 카테고리 배지와 넉넉한 본문 미리보기로 시각적 밀도를 채운다. */}
        {!hasCover && post.eyebrow ? (
          <span className="mb-2.5 inline-flex w-fit items-center rounded-md border border-border/80 bg-muted/50 px-2 py-0.5 text-[11px] font-medium tracking-[-0.01em] text-muted-foreground">
            {post.eyebrow}
          </span>
        ) : null}

        {/* 제목: 2줄로 클램프(길어도 카드가 안 늘어남). 1줄이면 자연 높이라 본문과 붙음. */}
        <h3
          className={`line-clamp-2 font-semibold tracking-[-0.02em] text-foreground transition-colors group-hover:text-primary ${
            hasCover ? 'text-[0.95rem] leading-6' : 'text-[1.0625rem] leading-6.5'
          }`}
        >
          {post.title}
        </h3>

        {/* 요약: 제목 바로 아래. 커버 유무에 따라 줄 수를 조절하고, 비어 있으면 공간을 차지하지 않는다.
            whitespace="keep" 로 단어단위 줄바꿈(word-break:keep-all)을 적용한다. */}
        {post.excerpt ? (
          <Textfield
            whitespace="keep"
            className={`text-muted-foreground ${
              hasCover ? 'mt-1.5 line-clamp-2 text-[0.83rem] leading-5' : 'mt-2 line-clamp-5 text-[0.85rem] leading-5.5'
            }`}
          >
            {post.excerpt}
          </Textfield>
        ) : null}

        {/* 날짜/댓글: mt-auto 로 카드 하단에 고정 */}
        <div className="mt-auto flex items-center justify-between pt-3.5 text-[11px] text-muted-foreground tabular-nums">
          <span>{post.publishedAt}</span>
          <span>{post.comments}개의 댓글</span>
        </div>
      </CardContent>
    </>
  );

  return (
    <Card
      className={`min-h-[21.5rem] gap-0 rounded-lg border-border/80 py-0 shadow-2xs transition-colors duration-150 hover:border-foreground/25 ${
        hasCover ? '' : 'bg-gradient-to-b from-muted/35 via-card to-card'
      }`}
    >
      {detailHref ? (
        <Link href={detailHref} className="group flex flex-1 flex-col">
          {detailBody}
        </Link>
      ) : (
        <div className="flex flex-1 flex-col">{detailBody}</div>
      )}

      <CardFooter className="justify-between rounded-b-lg border-t border-border/70 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
        <p>
          by{' '}
          {userHref ? (
            <Link href={userHref} className="font-medium text-foreground hover:underline">
              {post.author}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{post.author}</span>
          )}
        </p>

        <p className="inline-flex items-center gap-1 font-medium text-foreground tabular-nums">
          <Heart className={`h-3.5 w-3.5 ${post.liked ? 'fill-current text-primary' : 'text-muted-foreground'}`} />
          <span>{post.likes}</span>
        </p>
      </CardFooter>
    </Card>
  );
}
