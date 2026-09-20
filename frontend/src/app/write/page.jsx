'use client';

// /write — 작성 모드. 실제 로직은 PostEditorPage(공용 컴포넌트)에 위임한다.
import PostEditorPage from '@/components/domain/post-editor/feature/PostEditorPage';

export default function PostWritePage() {
  return <PostEditorPage />;
}
