import { cn } from '@/lib/utils';

/**
 * AI 추천 텍스트 뒤에 사용자에게 수락 단축키를 안내하는 반투명 뱃지 컴포넌트입니다.
 */
export default function PostEditorAiBadge({ className, label = 'Tab' }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'ml-1.5 inline-flex items-center rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted-foreground select-none pointer-events-none',
        className,
      )}
    >
      {label}
    </span>
  );
}
