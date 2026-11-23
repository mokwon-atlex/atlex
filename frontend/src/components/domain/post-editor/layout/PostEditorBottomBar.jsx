'use client';

// [Section] 에디터 하단 고정 액션 바 — 글자 수, 공개 상태, 임시 저장, 게시 버튼.
// 긴 글을 작성한 뒤에도 스크롤을 올리지 않고 바로 임시 저장·게시할 수 있다.
import { Button } from '@/components/common/ui/button';

export default function PostEditorBottomBar({
  charCount = 0,
  isPublic = true,
  saveDraftButtonLabel = '임시 저장',
  onSaveDraft,
  onPublish,
  publishButtonLabel = '게시',
  publishDisabled = false,
}) {
  return (
    <footer className="sticky bottom-0 z-30 mt-auto border-t border-border/60 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            총 <strong className="font-semibold text-foreground">{charCount.toLocaleString()}</strong>자
          </span>
          <span className="h-3 w-px bg-border/70" aria-hidden="true" />
          <span>{isPublic ? '전체 공개' : '비공개'}</span>
        </div>

        <div className="flex items-center gap-2.5">
          {onSaveDraft && (
            <Button type="button" variant="outline" size="default" onClick={onSaveDraft}>
              {saveDraftButtonLabel}
            </Button>
          )}
          <Button type="button" variant="default" size="default" onClick={onPublish} disabled={publishDisabled}>
            {publishButtonLabel}
          </Button>
        </div>
      </div>
    </footer>
  );
}
