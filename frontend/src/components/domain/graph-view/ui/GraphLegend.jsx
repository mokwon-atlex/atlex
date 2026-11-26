import { memo } from 'react';

import { getGraphTheme } from '@/lib/graph-view/graph-view-utils';

/** 간선 두께 의미와 노드 조작 방법을 안내하는 범례 패널이다. */
export const GraphLegend = memo(function GraphLegend({ canvasTheme = 'dark', offsetLeftClass = 'left-4' }) {
  const theme = getGraphTheme(canvasTheme);
  const items = [
    { label: '약한 연관', width: 1.4 },
    { label: '강한 연관', width: 3.1 },
  ];

  return (
    <div
      className={`absolute bottom-20 ${offsetLeftClass} z-20 hidden flex-col gap-1.5 rounded-lg border border-border/80 bg-card/90 px-4 py-2.5 shadow-sm backdrop-blur-md transition-[left] duration-200 md:flex`}
    >
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <svg height="16" width="52">
            <line
              stroke={theme.legendLineColor}
              strokeLinecap="round"
              strokeWidth={item.width}
              x1="4"
              x2="48"
              y1="8"
              y2="8"
            />
          </svg>
          <span className="text-xs font-bold text-foreground">{item.label}</span>
        </div>
      ))}
      <p className="pt-1 text-[11px] font-bold text-muted-foreground">호버: 연결·키워드·미리보기</p>
      <p className="text-[11px] font-bold text-muted-foreground">드래그: 노드 재배치 / 클릭: 게시글 열기</p>
    </div>
  );
});
