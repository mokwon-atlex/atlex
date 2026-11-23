// [Layout] 에디터 전체를 감싸는 풀-블리드 아티클 에디터 쉘.
// data-post-editor-shell 속성은 반드시 유지해야 한다.
export default function PostEditorShell({ children }) {
  return (
    <div data-post-editor-shell className="relative flex min-h-screen flex-col bg-background">
      {children}
    </div>
  );
}
