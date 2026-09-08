export default function BlogMainFilterBar({ filters = [], activeFilterId, onChangeFilter }) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Browse View</p>

      {/* 작은 화면에서는 가로 스크롤로 처리해 칩이 어수선하게 줄바꿈되지 않게 합니다. */}
      <div className="flex min-w-0 gap-2 overflow-x-auto rounded-[1.15rem] border border-border bg-muted/50 p-1">
        {filters.map((filter) => {
          const isActive = filter.id === activeFilterId;

          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChangeFilter?.(filter.id)}
              className={[
                'shrink-0 rounded-[0.95rem] px-4 py-2.5 text-[0.86rem] font-semibold transition',
                isActive
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-card/70 hover:text-foreground',
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
