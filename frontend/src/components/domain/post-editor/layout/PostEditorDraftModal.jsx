// [Section] 임시 저장 목록 모달 — Dialog(shadcn) portal로 body에 마운트.
// PostEditorShell 바깥에 렌더해야 Dialog가 전체 화면을 제대로 덮는다.
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/common/ui/dialog";
import { Textfield } from "@/components/common/ui/textfield";
import PostEditorDraftCard from "@/components/domain/post-editor/ui/PostEditorDraftCard";

export default function PostEditorDraftModal({
  drafts,
  isOpen,
  onClose,
  onLoadDraft,   // (draft) => void — 로드 버튼 핸들러
  onDeleteDraft, // (draft) => void — 삭제 버튼 핸들러
}) {
  const handleOpenChange = (next) => {
    if (!next) onClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent size="xl" className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <Textfield
            variant="muted"
            size="xs"
            weight="semibold"
            className="uppercase tracking-[0.18em]"
          >
            임시 저장 목록
          </Textfield>
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            임시 저장 목록
          </DialogTitle>
          <DialogDescription>총 {drafts.length}개</DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {drafts.map((draft) => (
            <PostEditorDraftCard
              key={draft.id}
              draft={draft}
              onLoad={onLoadDraft}
              onDelete={onDeleteDraft}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
