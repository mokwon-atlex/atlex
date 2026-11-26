import { tagMeta } from '@/lib/graph-view/graph-view-utils';
import { cn } from '@/lib/utils';

/** 연결 간선 위에 공유 키워드(또는 직접 연결) 배지를 표시한다. */
export function EdgeKeywordTooltip({ canvasTheme = 'dark', edge, x, y }) {
  const tags = edge.isExplicit ? ['직접 연결'] : edge.sharedTags;
  const visibleTags = tags.slice(0, 3);
  const hiddenCount = Math.max(tags.length - visibleTags.length, 0);

  if (visibleTags.length === 0) {
    return null;
  }

  const isLight = canvasTheme === 'light';

  return (
    <foreignObject
      className="pointer-events-none overflow-visible"
      data-edge-keyword-tooltip={edge.id}
      height="40"
      width="220"
      x={x - 110}
      y={y - 20}
    >
      <div className="flex h-10 items-center justify-center">
        <div
          className={cn(
            'flex max-w-[210px] items-center gap-1 rounded-full border px-2 py-0.5 shadow-sm backdrop-blur-sm',
            isLight
              ? 'border-slate-300/90 bg-white/95 text-slate-800'
              : 'border-slate-700/80 bg-slate-950/90 text-slate-100',
          )}
        >
          {visibleTags.map((tag) => {
            const meta = edge.isExplicit ? { bg: '#E2E8F0', text: '#334155' } : tagMeta(tag);

            return (
              <span
                key={tag}
                className="max-w-16 truncate rounded-full px-1.5 py-0.5 text-[10px] font-black"
                style={{ background: meta.bg, color: meta.text }}
              >
                {tag}
              </span>
            );
          })}
          {hiddenCount > 0 ? (
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-black',
                isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-300',
              )}
            >
              +{hiddenCount}
            </span>
          ) : null}
        </div>
      </div>
    </foreignObject>
  );
}
