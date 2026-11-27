'use client';

// [Section] 에디터 하단 고정 액션 바 — 글자 수, 공개 상태, 임시 저장, 게시 버튼.
// 스크롤 위치와 무관하게 화면 하단에 항상 고정되어 언제든 임시 저장·게시 모달을 열 수 있다.
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
    <footer className="sticky bottom-0 z-30 mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/95 px-5 py-3.5 shadow-[0_-8px_24px_-16px_rgba(15,23,42,0.22)] backdrop-blur-md sm:px-7 dark:border-zinc-700/90 dark:shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.65)]">
      <div className="flex items-center gap-3 text-xs text-muted-foreground dark:text-zinc-300">
        <span>
          총 <strong className="font-semibold text-foreground">{charCount.toLocaleString()}</strong>자
        </span>
        <span className="h-3 w-px bg-border dark:bg-zinc-600" aria-hidden="true" />
        <span>{isPublic ? '전체 공개' : '비공개'}</span>
      </div>

      <div className="flex items-center gap-2.5">
        {onSaveDraft && (
          <Button type="button" variant="outline" size="default" onClick={onSaveDraft} className="dark:border-zinc-600">
            {saveDraftButtonLabel}
          </Button>
        )}
        <Button type="button" variant="default" size="default" onClick={onPublish} disabled={publishDisabled}>
          {publishButtonLabel}
        </Button>
      </div>
    </footer>
  );
}
