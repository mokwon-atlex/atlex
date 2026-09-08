'use client';

import { Check, LoaderCircle, Pencil, Trash2, X } from 'lucide-react';

import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';

export default function BlogOptionCategoryItem({
  category,
  editingName = '',
  isEditing = false,
  isUpdating = false,
  isDeleting = false,
  onStartEdit,
  onEditingNameChange,
  onCancelEdit,
  onUpdate,
  onDelete,
}) {
  const isBusy = isUpdating || isDeleting;

  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
      {isEditing ? (
        <form
          onSubmit={(event) => onUpdate(event, category.id)}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Input
            variant="outline"
            size="lg"
            value={editingName}
            onChange={(event) => onEditingNameChange(event.target.value)}
            className="h-10 flex-1 rounded-xl"
            placeholder="카테고리 이름"
            disabled={isBusy}
            autoFocus
          />
          <div className="flex items-center justify-end gap-2">
            <Button type="submit" variant="secondary" size="sm" disabled={isBusy}>
              {isUpdating ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  저장 중
                </>
              ) : (
                <>
                  <Check className="size-4" />
                  저장
                </>
              )}
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={isBusy} onClick={onCancelEdit}>
              <X className="size-4" />
              취소
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="break-words font-semibold text-foreground">{category.name}</p>
            <p className="text-xs text-muted-foreground">사용 중인 블로그 카테고리</p>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" disabled={isBusy} onClick={() => onStartEdit(category)}>
              <Pencil className="size-4" />
              수정
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isBusy}
              onClick={() => onDelete(category.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              {isDeleting ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              삭제
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
