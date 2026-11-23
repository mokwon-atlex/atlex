'use client';

// [Layout] 에디터 캔버스(본문 영역)와 상단 툴바를 배치하는 레이아웃 컴포넌트.
//
// 동작 방식:
//   - 상단 툴바는 스크롤 시에도 상단 바 바로 아래에 고정되어 편집 기능을 즉시 실행할 수 있다.
//   - 본문 영역은 최소 높이를 확보하고 콘텐츠 길이에 따라 자연스럽게 확장된다.

export default function PostEditorCanvasLayout({ content, toolRail }) {
  return (
    <section className="flex min-h-[560px] flex-col">
      {/* 상단 툴바 — 주요 편집 기능을 한 번에 확인하고 바로 실행할 수 있도록 배치한다. */}
      <aside className="sticky top-[65px] z-10 shrink-0 border-b border-border/80 bg-background/95 backdrop-blur-sm">
        {toolRail}
      </aside>

      {/* 본문 영역 — 툴바 아래 남은 공간을 모두 사용하도록 배치한다. */}
      <div className="flex min-h-[500px] min-w-0 flex-1 flex-col">{content}</div>
    </section>
  );
}
