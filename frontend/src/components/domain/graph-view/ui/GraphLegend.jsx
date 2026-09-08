export function GraphLegend() {
  const items = [
    { label: '공통 태그 적음', dashed: false, width: 2.5, arrow: false },
    { label: '공통 태그 보통', dashed: false, width: 4, arrow: false },
    { label: '공통 태그 많음', dashed: false, width: 5.5, arrow: false },
    { label: '명시적 링크', dashed: true, width: 2.5, arrow: true },
  ];

  return (
    <div className="absolute bottom-20 left-6 hidden flex-col gap-1.5 rounded-xl border border-border bg-card/90 px-5 py-3 shadow-md backdrop-blur-sm md:flex">
      {items.map((item, index) => {
        const markerId = `legend-arrow-${index}`;

        return (
          <div key={item.label} className="flex items-center gap-3">
            <svg height="18" width="58">
              <defs>
                <marker
                  id={markerId}
                  markerHeight="6"
                  markerUnits="userSpaceOnUse"
                  markerWidth="7"
                  orient="auto"
                  refX="7"
                  refY="3"
                >
                  <polygon fill="#6B7280" points="0,0 7,3 0,6" />
                </marker>
              </defs>
              <line
                markerEnd={item.arrow ? `url(#${markerId})` : undefined}
                stroke="#6B7280"
                strokeDasharray={item.dashed ? '5,3' : undefined}
                strokeLinecap="butt"
                strokeWidth={item.width}
                x1="2"
                x2="50"
                y1="9"
                y2="9"
              />
            </svg>
            <span className="text-xs font-bold text-foreground">{item.label}</span>
          </div>
        );
      })}
      <p className="pt-1 text-[11px] font-bold text-muted-foreground">간선 hover 시 연결 키워드 표시</p>
    </div>
  );
}
