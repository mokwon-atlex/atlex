'use client';

// /write — 작성 모드. 실제 로직은 PostEditorPage(공용 컴포넌트)에 위임한다.
import PostEditorPage from '@/components/domain/post-editor/feature/PostEditorPage';

/** 게시글 작성 페이지. 로직은 공용 컴포넌트 PostEditorPage에 위임한다. */
export default function PostWritePage() {
  return <PostEditorPage />;
}
