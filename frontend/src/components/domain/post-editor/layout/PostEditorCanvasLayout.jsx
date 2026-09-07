"use client";

// [Layout] 에디터 캔버스(본문 영역)와 상단 툴바를 배치하는 레이아웃 컴포넌트.
//
// 동작 방식:
//   - 상단 툴바는 본문 위에 고정 배치하여 사용자가 모든 편집 기능을 한 번에 확인할 수 있게 한다.
//   - 본문 영역은 남은 높이를 채워 에디터 작성 공간을 안정적으로 유지한다.

export default function PostEditorCanvasLayout({ content, toolRail }) {
  return (
    <section className="flex h-[820px] min-h-[820px] flex-col">
      {/* 상단 툴바 — 주요 편집 기능을 한 번에 확인하고 바로 실행할 수 있도록 배치한다. */}
      <aside className="shrink-0 border-b border-border bg-background">
        {toolRail}
      </aside>

      {/* 본문 영역 — 툴바 아래 남은 공간을 모두 사용하도록 배치한다. */}
      <div className="min-h-0 min-w-0 flex-1">
        {content}
      </div>
    </section>
  );
}