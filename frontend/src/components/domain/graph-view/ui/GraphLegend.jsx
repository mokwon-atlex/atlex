/** 게시글 링크와 노드별 연결 강조 방식을 안내한다. */
export function GraphLegend() {
  const items = [{ label: '게시글 링크', width: 1.35 }];

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
      <p className="pt-1 text-[11px] font-bold text-muted-foreground">노드에 올리면 연결 강조와 게시글 미리보기 표시</p>
    </div>
  );
}
