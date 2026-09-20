'use client';

// /write/[postId] — 수정 모드. postId를 PostEditorPage(공용 컴포넌트)에 전달한다.
// layout.jsx가 상위(/write)에 있어 RequireAuth(로그인 가드)는 그대로 적용된다.
import { useParams } from 'next/navigation';
import PostEditorPage from '@/components/domain/post-editor/feature/PostEditorPage';

export default function PostEditPage() {
  const { postId } = useParams();
  return <PostEditorPage postId={postId} />;
}
