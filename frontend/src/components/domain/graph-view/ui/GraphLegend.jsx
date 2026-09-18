/** API 관계의 공통 키워드 수에 따른 간선 굵기 기준을 안내한다. */
export function GraphLegend() {
  const items = [
    { label: '공통 키워드 1개', width: 2.5 },
    { label: '공통 키워드 2개', width: 4 },
    { label: '공통 키워드 3개 이상', width: 5.5 },
  ];

  return (
    <div className="absolute bottom-20 left-6 hidden flex-col gap-1.5 rounded-xl border border-border bg-card/90 px-5 py-3 shadow-md backdrop-blur-sm md:flex">
      {items.map((item) => {
        return (
          <div key={item.label} className="flex items-center gap-3">
            <svg height="18" width="58">
              <line stroke="#6B7280" strokeLinecap="butt" strokeWidth={item.width} x1="2" x2="50" y1="9" y2="9" />
            </svg>
            <span className="text-xs font-bold text-foreground">{item.label}</span>
          </div>
        );
      })}
      <p className="pt-1 text-[11px] font-bold text-muted-foreground">간선 hover 시 연결 키워드 표시</p>
    </div>
  );
}
