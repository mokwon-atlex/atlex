// [Layout] 에디터 전체를 감싸는 풀-스크린 쉘.
// sticky 상단 바·툴바·하단 게시 바가 정상 동작하도록 overflow-hidden 대신 overflow-x-clip 을 사용한다.
export default function PostEditorShell({ children }) {
  return (
    <div className="relative">
      <div data-post-editor-shell className="flex min-h-screen flex-col overflow-x-clip bg-background">
        {children}
      </div>
    </div>
  );
}
