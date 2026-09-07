// [Section] 에디터 상단 바 — 로고, 임시 저장 목록 열기, 게시 버튼
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/common/ui/button';

export default function PostEditorTopBar({
  draftButtonLabel = '임시 저장 목록',
  logoLabel = '로고',
  onOpenDraftModal, // 임시 저장 목록 모달 열기 핸들러
  onPublish, // 게시 버튼 핸들러
  publishButtonLabel = '게시 버튼',
  publishDisabled = false // 게시 진행 중 등 버튼 비활성화 여부
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-7">
      <Link href="/">
        <Button variant="outline" size="lg">
          {logoLabel}
        </Button>
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="default" onClick={onOpenDraftModal}>
          {draftButtonLabel}
        </Button>
        <Button variant="default" size="default" onClick={onPublish} disabled={publishDisabled}>
          {publishButtonLabel}
        </Button>
      </div>
    </div>
  );
}
