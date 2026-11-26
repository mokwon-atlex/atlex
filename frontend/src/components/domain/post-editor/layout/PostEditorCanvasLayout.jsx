'use client';

// [Layout] 상단 고정 바·통합 에디터 툴바와 문서(제목·본문) 캔버스를 배치하는 레이아웃 컴포넌트.
//
// 동작 방식:
//   - 상단 바와 통합 에디터 툴바를 하나의 sticky 컨테이너로 묶어 스크롤 시에도 간격 없이 상단에 따라온다.
//   - 문서 영역은 최소 높이를 확보하고 콘텐츠 길이에 따라 자연스럽게 확장된다.

export default function PostEditorCanvasLayout({ content, toolRail, topBar = null }) {
  return (
    <section className="flex min-h-[560px] flex-1 flex-col">
      {/* 상단 고정 영역 — 상단 바와 에디터 툴바가 스크롤 시에도 함께 화면 상단에 고정된다. */}
      <div className="sticky top-0 z-30 shrink-0">
        {topBar}
        <aside className="border-b border-border bg-background/95 backdrop-blur-md dark:border-zinc-700/90">
          {toolRail}
        </aside>
      </div>

      {/* 문서 영역 — 제목과 본문이 게시 후 상세 화면과 동일한 흐름으로 이어진다. */}
      <div className="flex min-h-[500px] min-w-0 flex-1 flex-col">{content}</div>
    </section>
  );
}
