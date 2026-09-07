// [Layout] 에디터 전체를 감싸는 둥근 카드 쉘.
// data-post-editor-shell 속성은 반드시 유지해야 한다 —
// PostEditorCanvasLayout이 .closest("[data-post-editor-shell]")로 플로팅 도크의 위치 기준을 잡는다.
export default function PostEditorShell({ children }) {
  return (
    <div className="relative">
      <div
        data-post-editor-shell
        className="overflow-hidden rounded-[26px] bg-background shadow-[0_24px_48px_-24px_rgba(15,23,42,0.28)]">
        {children}
      </div>
    </div>
  );
}
