// [Section] 에디터 상단 바 — 로고(홈 이동/이탈 확인), 남은 AI 토큰, 임시 저장 목록
import Link from 'next/link';
import { Button } from '@/components/common/ui/button';

export default function PostEditorTopBar({
  draftButtonLabel = '임시 저장 목록',
  saveDraftButtonLabel = '임시 저장',
  logoLabel = '로고',
  onOpenDraftModal, // 임시 저장 목록 모달 열기 핸들러
  onRequestExit, // 로고 클릭 시 이탈/임시 저장 확인 핸들러
  onSaveDraft, // 임시 저장 실행 핸들러
  onPublish, // (선택) 상단 바 단독 사용 시 게시 버튼 핸들러
  publishButtonLabel = '게시',
  publishDisabled = false,
  remainingTokens = null,
  maxTokens = null,
}) {
  const logoImages = (
    <>
      <img src="/logo/atlex-light.svg" alt={logoLabel} className="max-h-full max-w-full object-contain dark:hidden" />
      <img
        src="/logo/atlex-dark.svg"
        alt={logoLabel}
        className="hidden max-h-full max-w-full object-contain dark:block"
      />
    </>
  );

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-background/95 px-5 py-3 backdrop-blur-md sm:px-7 dark:border-zinc-700/90">
      <div className="flex items-center">
        {onRequestExit ? (
          <button
            type="button"
            onClick={onRequestExit}
            aria-label={logoLabel}
            title="홈으로 이동"
            className="inline-flex h-8 w-16 cursor-pointer items-center rounded-md transition-opacity hover:opacity-80"
          >
            {logoImages}
          </button>
        ) : (
          <Link
            href="/"
            aria-label={logoLabel}
            title="홈으로 이동"
            className="inline-flex h-8 w-16 items-center transition-opacity hover:opacity-80"
          >
            {logoImages}
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {remainingTokens !== null && maxTokens !== null && (
          <div className="rounded-full border border-border bg-muted/45 px-3 py-1 text-xs font-medium text-muted-foreground dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200">
            AI 토큰{' '}
            {remainingTokens === 0 ? (
              <span className="font-bold text-destructive">0</span>
            ) : (
              <span className="font-semibold text-foreground">{remainingTokens.toLocaleString()}</span>
            )}{' '}
            / {maxTokens.toLocaleString()}
          </div>
        )}
        <Button type="button" variant="outline" size="sm" onClick={onOpenDraftModal} className="dark:border-zinc-600">
          {draftButtonLabel}
        </Button>
        {onPublish && (
          <>
            {onSaveDraft && (
              <Button type="button" variant="outline" size="sm" onClick={onSaveDraft} className="dark:border-zinc-600">
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
