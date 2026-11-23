'use client';

// [Layout] 아티클 본문 영역과 상단 서식 툴바를 배치하는 레이아웃 컴포넌트.
// 툴바는 전체 너비에 은은한 경계선으로 고정되고, 본문은 중앙 아티클 칼럼 폭에 맞춰 배치된다.

export default function PostEditorCanvasLayout({ content, toolRail }) {
  return (
    <section className="flex flex-1 flex-col">
      <aside className="sticky top-[53px] z-20 shrink-0 border-y border-border/60 bg-background/95 backdrop-blur-md">
        <div className="mx-auto w-full max-w-4xl px-2 sm:px-4">{toolRail}</div>
      </aside>

      <div className="mx-auto flex min-h-[540px] w-full max-w-4xl flex-1 flex-col">{content}</div>
    </section>
  );
}
