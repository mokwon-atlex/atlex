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
      <CardContent className={`flex min-h-[7.5rem] flex-1 flex-col px-3 pb-3 ${hasCover ? 'pt-3' : 'pt-3.5'}`}>
        {/* 제목: 2줄로 클램프(길어도 카드가 안 늘어남). 1줄이면 자연 높이라 본문과 붙음. */}
        <h3 className="line-clamp-2 text-[0.88rem] font-bold leading-5.5 tracking-[-0.03em] text-foreground group-hover:underline">
          {post.title}
        </h3>

        {/* 요약: 제목 바로 아래. 2줄 클램프. 비어 있으면 공간을 차지하지 않는다.
            whitespace="keep" 로 단어단위 줄바꿈(word-break:keep-all)을 적용한다. */}
        {post.excerpt ? (
          <Textfield whitespace="keep" className="mt-1.5 line-clamp-2 text-[0.74rem] leading-5 text-muted-foreground">
            {post.excerpt}
          </Textfield>
        ) : null}

        {/* 날짜/댓글: mt-auto 로 카드 하단에 고정 */}
        <div className="mt-auto flex items-center justify-between pt-3.5 text-[0.62rem] text-muted-foreground">
          <span>{post.publishedAt}</span>
          <span>{post.comments}개의 댓글</span>
        </div>
      </CardContent>
    </>
  );

  return (
    <Card className="min-h-[20rem] gap-0 rounded-[9px] py-0">
      {detailHref ? (
        <Link href={detailHref} className="group flex flex-1 flex-col">
          {detailBody}
        </Link>
      ) : (
        <div className="flex flex-1 flex-col">{detailBody}</div>
      )}

      <CardFooter className="justify-between rounded-b-[9px] bg-transparent px-3 py-2 text-[0.68rem] text-muted-foreground">
        <p>
          by{' '}
          {userHref ? (
            <Link href={userHref} className="font-semibold text-foreground hover:underline">
              {post.author}
            </Link>
          ) : (
            <span className="font-semibold text-foreground">{post.author}</span>
          )}
        </p>

        <p className="inline-flex items-center gap-1 font-semibold text-foreground">
          <Heart className="h-3 w-3 fill-current" />
          <span>{post.likes}</span>
        </p>
      </CardFooter>
    </Card>
  );
}
