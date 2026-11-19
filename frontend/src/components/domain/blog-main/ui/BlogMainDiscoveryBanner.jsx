import Link from 'next/link';
import { ArrowUpRight, Heart, MessageSquare, Network, Sparkles } from 'lucide-react';
import { postDetailHref } from '@/lib/url/handle';

/**
 * 메인 페이지 최상단 디스커버리 배너.
 * 지식 그래프 탐색 진입점과 함께 여러 개의 주요 포스트를 한눈에 노출한다.
 */
export default function BlogMainDiscoveryBanner({ featuredPosts = [], graphStats }) {
  const primaryPost = featuredPosts[0] ?? null;
  const secondaryPosts = featuredPosts.slice(1, 4);
  const primaryHref =
    primaryPost?.authorUserId && primaryPost?.id ? postDetailHref(primaryPost.authorUserId, primaryPost.id) : null;

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-muted/60 via-card to-card p-5 shadow-xs sm:p-6">
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[1.05fr_1.35fr]">
        <div className="flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-semibold text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              <span>AI 기술 블로그 · 지식 그래프</span>
              {graphStats && graphStats.nodeCount > 0 ? (
                <span className="border-l border-border pl-2 text-foreground">
                  문서 {graphStats.nodeCount} · 연결 {graphStats.edgeCount}
                </span>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl font-bold leading-snug tracking-[-0.04em] text-foreground sm:text-2xl">
                글이 하나의 지식 그래프로 연결되는 개발 블로그
              </h1>
              <p className="max-w-lg text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
                코드 블록·Mermaid 다이어그램·수식으로 정리한 기술 아티클을 태그와 문맥 그래프 뷰로 탐색하세요.
              </p>
            </div>
          </div>

          <div>
            <Link
              href="/graph"
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-all hover:-translate-y-0.5 hover:opacity-95 sm:text-sm"
            >
              <Network className="size-4" />
              지식 그래프 탐색
            </Link>
          </div>
        </div>

        {primaryPost ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col justify-between rounded-xl border border-border bg-background/95 p-4 shadow-xs transition-all hover:border-foreground/15 hover:shadow-md">
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary uppercase">
                    Spotlight
                  </span>
                  {primaryPost.eyebrow ? (
                    <span className="truncate text-[11px] font-medium text-muted-foreground">
                      {primaryPost.eyebrow}
                    </span>
                  ) : null}
                </div>

                {primaryHref ? (
                  <Link href={primaryHref} className="group block space-y-1.5">
                    <h2 className="line-clamp-2 text-sm font-bold leading-snug tracking-[-0.02em] text-foreground transition-colors group-hover:text-primary sm:text-base">
                      {primaryPost.title}
                    </h2>
                    {primaryPost.excerpt ? (
                      <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">{primaryPost.excerpt}</p>
                    ) : null}
                  </Link>
                ) : null}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5 text-[11px] text-muted-foreground">
                <span className="truncate font-medium text-foreground">by {primaryPost.author}</span>
                <div className="flex shrink-0 items-center gap-2.5">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="size-3" />
                    {primaryPost.likes}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="size-3" />
                    {primaryPost.comments}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-2">
              {secondaryPosts.length > 0 ? (
                secondaryPosts.map((item) => {
                  const href = item?.authorUserId && item?.id ? postDetailHref(item.authorUserId, item.id) : null;
                  const cardBody = (
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-border/80 bg-background/90 px-3 py-2.5 transition-all hover:border-foreground/15 hover:bg-background hover:shadow-xs">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground sm:text-[0.8rem]">{item.title}</p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          by {item.author} · 좋아요 {item.likes} · 댓글 {item.comments}
                        </p>
                      </div>
                      <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
                    </div>
                  );
                  return href ? (
                    <Link key={item.id} href={href} className="block">
                      {cardBody}
                    </Link>
                  ) : (
                    <div key={item.id}>{cardBody}</div>
                  );
                })
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border bg-background/50 p-4 text-center text-xs text-muted-foreground">
                  더 많은 아티클이 등록되면 주요 글이 이곳에 함께 표시됩니다.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[140px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/60 p-6 text-center">
            <Network className="mb-2 size-7 text-primary/70" />
            <p className="text-sm font-semibold text-foreground">첫 기술 아티클을 작성해 보세요</p>
            <p className="mt-1 text-xs text-muted-foreground">작성한 글과 태그가 지식 그래프에 자동으로 연결됩니다.</p>
          </div>
        )}
      </div>
    </section>
  );
}
