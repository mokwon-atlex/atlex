import { tagMeta } from '@/components/domain/graph-view/lib/graph-view-utils';

export function EdgeKeywordTooltip({ edge, x, y }) {
  const tags = edge.isExplicit ? ['직접 연결'] : edge.sharedTags;
  const visibleTags = tags.slice(0, 3);
  const hiddenCount = Math.max(tags.length - visibleTags.length, 0);

  return (
    <foreignObject className="pointer-events-none overflow-visible" height="48" width="220" x={x - 110} y={y - 24}>
      <div className="flex h-12 items-center justify-center">
        <div className="flex max-w-[210px] items-center gap-1.5 rounded-full border border-border bg-card/95 px-2.5 py-1.5 shadow-lg shadow-slate-900/12 backdrop-blur-sm">
          {visibleTags.map((tag) => {
            const meta = edge.isExplicit ? { bg: '#F3F4F6', text: '#4B5563' } : tagMeta(tag);

            return (
              <span
                key={tag}
                className="max-w-16 truncate rounded-full px-2 py-0.5 text-[11px] font-black"
                style={{ background: meta.bg, color: meta.text }}
              >
                {tag}
              </span>
            );
          })}
          {hiddenCount > 0 ? (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-black text-muted-foreground">
              +{hiddenCount}
            </span>
          ) : null}
        </div>
      </div>
    </foreignObject>
  );
}
