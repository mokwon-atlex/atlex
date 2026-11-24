// [Section] 에디터 상단 바 — 로고, 남은 AI 토큰, 임시 저장 목록
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/ui/button';

export default function PostEditorTopBar({
  draftButtonLabel = '임시 저장 목록',
  saveDraftButtonLabel = '임시 저장',
  logoLabel = '로고',
  onOpenDraftModal, // 임시 저장 목록 모달 열기 핸들러
  onSaveDraft, // 임시 저장 실행 핸들러
  onPublish, // (선택) 상단 바 단독 사용 시 게시 버튼 핸들러
  publishButtonLabel = '게시',
  publishDisabled = false,
  remainingTokens = null,
  maxTokens = null,
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border/80 bg-background/95 px-5 py-3 backdrop-blur-sm sm:px-7">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="나가기"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          <span>나가기</span>
        </Link>
        <span className="h-4 w-px bg-border/70" aria-hidden="true" />
        <Link href="/" aria-label={logoLabel} className="inline-flex h-8 w-16 items-center">
          <img
            src="/logo/atlex-light.svg"
            alt={logoLabel}
            className="max-h-full max-w-full object-contain dark:hidden"
          />
          <img
            src="/logo/atlex-dark.svg"
            alt={logoLabel}
            className="hidden max-h-full max-w-full object-contain dark:block"
          />
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {remainingTokens !== null && maxTokens !== null && (
          <div className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            AI 토큰{' '}
            {remainingTokens === 0 ? (
              <span className="font-bold text-destructive">0</span>
            ) : (
              <span className="font-semibold text-foreground">{remainingTokens.toLocaleString()}</span>
            )}{' '}
            / {maxTokens.toLocaleString()}
          </div>
        )}
        <Button type="button" variant="outline" size="sm" onClick={onOpenDraftModal}>
          {draftButtonLabel}
        </Button>
        {onPublish && (
          <>
            {onSaveDraft && (
              <Button type="button" variant="outline" size="sm" onClick={onSaveDraft}>
                {saveDraftButtonLabel}
              </Button>
            )}
            <Button type="button" variant="default" size="sm" onClick={onPublish} disabled={publishDisabled}>
              {publishButtonLabel}
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
