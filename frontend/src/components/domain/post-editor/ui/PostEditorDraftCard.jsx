// [Group] 임시 저장 목록 한 줄 카드 — 날짜·제목·본문 미리보기 + 로드/삭제 버튼
import { FolderOpen, Trash2 } from "lucide-react";

import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Separator } from "@/components/common/ui/separator";
import { Textfield } from "@/components/common/ui/textfield";

export default function PostEditorDraftCard({
  draft, // { id, title, body, updatedAt }
  loadButtonLabel = "로드",
  deleteButtonLabel = "삭제",
  onLoad,   // (draft) => void
  onDelete, // (draft) => void
}) {
  return (
    <Card size="sm" className="bg-muted/40">
      <CardHeader>
        <Textfield
          variant="muted"
          size="xs"
          weight="semibold"
          className="uppercase tracking-[0.18em]"
        >
          {draft.updatedAt}
        </Textfield>
        <CardTitle className="text-lg">{draft.title}</CardTitle>
        <CardAction>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLoad ? () => onLoad(draft) : undefined}
            >
              <FolderOpen className="h-4 w-4" />
              {loadButtonLabel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDelete ? () => onDelete(draft) : undefined}
            >
              <Trash2 className="h-4 w-4" />
              {deleteButtonLabel}
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      <Separator />

      <CardContent>
        <Textfield
          variant="muted"
          size="sm"
          className="max-w-2xl leading-6"
        >
          {draft.body}
        </Textfield>
      </CardContent>
    </Card>
  );
}
