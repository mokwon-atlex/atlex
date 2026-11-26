// [Layout] 에디터 전체를 감싸는 둥근 카드 쉘.
// sticky 상단 바·툴바·하단 게시 바가 정상 동작하도록 overflow-hidden 대신 overflow-x-clip 을 사용한다.
export default function PostEditorShell({ children }) {
  return (
    <div className="relative">
      <div
        data-post-editor-shell
        className="flex min-h-[calc(100vh-2rem)] flex-col overflow-x-clip rounded-[26px] border border-border bg-background shadow-[0_24px_48px_-24px_rgba(15,23,42,0.28)] dark:border-zinc-700/90"
      >
        {children}
      </div>
    </div>
  );
}
