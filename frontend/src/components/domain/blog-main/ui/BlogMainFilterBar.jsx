export default function BlogMainFilterBar({ filters = [], activeFilterId, onChangeFilter }) {
  return (
    <div className="min-w-0">
      {/* 작은 화면에서는 가로 스크롤로 처리해 칩이 어수선하게 줄바꿈되지 않게 합니다. */}
      <div className="inline-flex min-w-0 max-w-full gap-1 overflow-x-auto rounded-lg border border-border/80 bg-muted/60 p-1">
        {filters.map((filter) => {
          const isActive = filter.id === activeFilterId;

          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChangeFilter?.(filter.id)}
              className={[
                'shrink-0 rounded-md border px-3.5 py-1.5 text-xs font-medium transition-colors',
                isActive
                  ? 'border-border/70 bg-background text-foreground shadow-2xs'
                  : 'border-transparent text-muted-foreground hover:bg-background/50 hover:text-foreground',
              ].join(' ')}
            >
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
