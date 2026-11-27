'use client';

// [Section] 글쓰기 이탈 확인 모달 — 작성 중인 내용이 있을 때 홈으로 나가기 전 임시 저장 여부를 확인한다.
import { Button } from '@/components/common/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/common/ui/dialog';

/**
 * 작성 중인 글이 있을 때 로고 클릭 등으로 홈으로 이탈하려 할 경우 임시 저장 여부를 묻는 확인 모달이다.
 *
 * @param {object} props
 * @param {boolean} props.isOpen 모달 열림 여부
 * @param {() => void} props.onClose 모달 닫기(계속 작성) 핸들러
 * @param {() => void} props.onLeaveWithoutSaving 저장하지 않고 나가기 핸들러
 * @param {() => void} props.onSaveDraftAndLeave 임시 저장 후 나가기 핸들러
 */
export default function PostEditorLeaveModal({ isOpen, onClose, onLeaveWithoutSaving, onSaveDraftAndLeave }) {
  const handleOpenChange = (next) => {
    if (!next) onClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md dark:border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">작성 중인 글이 있습니다</DialogTitle>
          <DialogDescription className="dark:text-zinc-300">
            지금 나가면 저장되지 않은 내용이 사라집니다. 나가기 전에 임시 저장하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            계속 작성
          </Button>
          <Button type="button" variant="outline" onClick={onLeaveWithoutSaving} className="dark:border-zinc-600">
            저장하지 않고 나가기
          </Button>
          <Button type="button" variant="default" onClick={onSaveDraftAndLeave}>
            임시 저장 후 나가기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
