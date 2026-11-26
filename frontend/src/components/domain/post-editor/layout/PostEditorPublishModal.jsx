'use client';

// [Section] 게시/수정 최종 확인 모달 — 설명·태그·카테고리·공개 여부·썸네일을 설정한 뒤 발행한다.
import { Button } from '@/components/common/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/common/ui/dialog';
import PostEditorMetaSection from '@/components/domain/post-editor/layout/PostEditorMetaSection';

export default function PostEditorPublishModal({
  isOpen,
  isEditMode = false,
  isPending = false,
  onClose,
  onConfirm,
  metaProps,
}) {
  const handleOpenChange = (next) => {
    if (!next && !isPending) onClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent size="xl" className="max-h-[85vh] overflow-y-auto dark:border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {isEditMode ? '게시글 수정 설정' : '게시글 발행 설정'}
          </DialogTitle>
          <DialogDescription className="dark:text-zinc-300">
            요약 설명, 태그, 카테고리, 공개 여부 및 대표 썸네일을 확인한 뒤 발행하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <PostEditorMetaSection {...metaProps} embedded />
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="dark:border-zinc-600"
          >
            취소
          </Button>
          <Button type="button" variant="default" onClick={onConfirm} disabled={isPending}>
            {isPending ? (isEditMode ? '수정 중…' : '게시 중…') : isEditMode ? '수정 저장' : '최종 게시'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
