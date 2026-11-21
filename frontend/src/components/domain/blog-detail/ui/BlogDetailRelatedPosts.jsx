import Link from 'next/link';
import { ArrowUpRight, Network } from 'lucide-react';
import { postDetailHref } from '@/lib/url/handle';

/**
 * 게시글 상세 하단에 현재 글과 연결된 연관 글 목록과 미니 지식 그래프를 표시한다.
 */
export default function BlogDetailRelatedPosts({ currentPostId, graph }) {
  const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph?.edges) ? graph.edges : [];
  const currentIdStr = String(currentPostId ?? '');

  const centerNode = nodes.find((n) => String(n.id) === currentIdStr) ?? null;
  const relatedNodes = nodes.filter((n) => String(n.id) !== currentIdStr).slice(0, 5);

  if (relatedNodes.length === 0) {
    return null;
  }

  const edgeScoreByTargetId = new Map();
  for (const edge of edges) {
    const sourceId = String(edge.source ?? edge.sourcePostId ?? '');
    const targetId = String(edge.target ?? edge.targetPostId ?? '');
    const score = Number(edge.score ?? edge.weight ?? 0);
    if (sourceId === currentIdStr) {
      edgeScoreByTargetId.set(targetId, score);
    } else if (targetId === currentIdStr) {
      edgeScoreByTargetId.set(sourceId, score);
    }
  }

  const centerX = 140;
  const centerY = 105;
  const radius = 72;

  return (
    <section className="rounded-lg border border-border/80 bg-card/70 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Network className="size-4 text-primary" />
          <h2 className="text-base font-bold tracking-tight text-foreground">이 글과 연결된 지식</h2>
        </div>
        <Link
          href="/graph"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          전체 그래프 보기
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-[280px_minmax(0,1fr)]">
        <div className="flex items-center justify-center rounded-md border border-border/80 bg-background/80 p-2">
          <svg viewBox="0 0 280 210" className="h-[210px] w-[280px]" role="img" aria-label="연관 글 미니 지식 그래프">
            {relatedNodes.map((node, index) => {
              const angle = (Math.PI * 2 * index) / relatedNodes.length - Math.PI / 2;
              const x = centerX + Math.cos(angle) * radius;
              const y = centerY + Math.sin(angle) * radius;
              const href = node.authorUserId ? postDetailHref(node.authorUserId, node.id) : null;

              return (
                <g key={node.id}>
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity={0.22}
                    strokeWidth={1.5}
                    className="text-primary"
                  />
                  {href ? (
                    <Link href={href}>
                      <circle
                        cx={x}
                        cy={y}
                        r={14}
                        className="fill-card stroke-primary/60 transition-colors hover:fill-primary/15"
                        strokeWidth={1.5}
                      />
                      <text
                        x={x}
                        y={y + 24}
                        textAnchor="middle"
                        className="fill-muted-foreground text-[9px] font-medium"
                      >
                        {(node.title ?? '').slice(0, 10)}
                        {(node.title ?? '').length > 10 ? '…' : ''}
                      </text>
                    </Link>
                  ) : null}
                </g>
              );
            })}

            <circle cx={centerX} cy={centerY} r={18} className="fill-primary stroke-background" strokeWidth={2.5} />
            <text
              x={centerX}
              y={centerY + 3}
              textAnchor="middle"
              className="fill-primary-foreground text-[9px] font-bold"
            >
              현재 글
            </text>
          </svg>
        </div>

        <div className="space-y-2">
          {relatedNodes.map((node) => {
            const href = node.authorUserId ? postDetailHref(node.authorUserId, node.id) : null;
            const rawScore = edgeScoreByTargetId.get(String(node.id));
            const scorePercent = rawScore ? Math.min(99, Math.round(rawScore * 100)) : null;

            const content = (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-background px-3.5 py-2.5 transition-all hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-xs">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{node.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {node.authorName || node.authorUserId || centerNode?.authorUserId || '작성자'}
                    {node.categoryName ? ` · ${node.categoryName}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {scorePercent ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      연관 {scorePercent}%
                    </span>
                  ) : null}
                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </div>
              </div>
            );

            return href ? (
              <Link key={node.id} href={href} className="block">
                {content}
              </Link>
            ) : (
              <div key={node.id}>{content}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
