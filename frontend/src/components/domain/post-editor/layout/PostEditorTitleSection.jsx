import { useRef } from 'react';
import { Sparkles } from 'lucide-react';

import { Capsule } from '@/components/common/ui/capsule';
import PostEditorAiBadge from '@/components/domain/post-editor/ui/PostEditorAiBadge';

/**
 * 게시 후 상세 화면(BlogDetailHero)과 통일된 에디토리얼 스타일의 제목 입력 섹션이다.
 * 태그는 발행 설정 모달에서 관리하고, 이 영역은 제목과 현재 메타 배지에 집중한다.
 */
export default function PostEditorTitleSection({
  categoryName = '',
  isPublic = true,
  isSuggestingTitle = false,
  onAcceptTitleSuggestion,
  onDismissTitleSuggestion,
  onRequestTitleSuggestion,
  onTitleChange,
  title,
  titlePlaceholder,
  titleSuggestion = '',
}) {
  const inputRef = useRef(null);
  const overlayRef = useRef(null);

  const syncScroll = () => {
    if (overlayRef.current && inputRef.current) {
      overlayRef.current.scrollLeft = inputRef.current.scrollLeft;
    }
  };

  const handleChange = (event) => {
    const nextValue = event.target.value;
    onTitleChange(nextValue);
    onRequestTitleSuggestion?.(nextValue);
  };

  const needsTitleSpace = Boolean(title && !title.endsWith(' ') && !titleSuggestion.startsWith(' '));
  const formattedTitleSuggestion = needsTitleSpace ? ` ${titleSuggestion}` : titleSuggestion;

  const handleKeyDown = (event) => {
    if (event.nativeEvent?.isComposing) return;

    if (event.key === 'Tab' && titleSuggestion) {
      event.preventDefault();
      if (onAcceptTitleSuggestion) {
        onAcceptTitleSuggestion(title);
      } else {
        onTitleChange(`${title}${formattedTitleSuggestion}`);
        onDismissTitleSuggestion?.();
      }
    } else if (event.key === 'Escape' && titleSuggestion) {
      event.preventDefault();
      onDismissTitleSuggestion?.();
    }
  };

  return (
    <section className="border-b border-border bg-background dark:border-zinc-700/90">
      <div className="mx-auto w-full max-w-4xl px-5 py-7 sm:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Capsule
              variant="outline"
              size="sm"
              className="text-[11px] font-semibold tracking-wider text-foreground/85 dark:border-zinc-600 dark:text-zinc-200"
            >
              {categoryName || '미분류'}
            </Capsule>
            <Capsule
              variant="outline"
              size="sm"
              className="rounded-md text-[11px] font-medium text-muted-foreground dark:border-zinc-600 dark:text-zinc-300"
            >
              {isPublic ? '전체 공개' : '비공개'}
            </Capsule>
          </div>

          {isSuggestingTitle ? (
            <span className="inline-flex animate-pulse items-center gap-1 text-xs text-muted-foreground dark:text-zinc-300">
              <Sparkles className="size-3 animate-spin text-primary" />
              <span>AI 제목 추천 중...</span>
            </span>
          ) : null}
        </div>

        <div className="relative">
          <label htmlFor="post-editor-title" className="sr-only">
            제목
          </label>
          <input
            ref={inputRef}
            id="post-editor-title"
            type="text"
            value={title}
            placeholder={titlePlaceholder}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onScroll={syncScroll}
            className="w-full bg-transparent py-1 text-2xl font-bold leading-tight tracking-tight text-foreground outline-none placeholder:text-muted-foreground/75 sm:text-4xl dark:placeholder:text-zinc-500"
          />

          {titleSuggestion ? (
            <div
              ref={overlayRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center overflow-hidden py-1 text-2xl font-bold leading-tight tracking-tight select-none sm:text-4xl"
            >
              <span className="invisible whitespace-pre">{title}</span>
              <span className="whitespace-pre text-muted-foreground/55 dark:text-zinc-500">
                {formattedTitleSuggestion}
              </span>
              <PostEditorAiBadge label="Tab" className="shrink-0" />
            </div>
          ) : null}
        </div>

        {titleSuggestion ? (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-border bg-muted/35 px-3 py-2 text-xs text-muted-foreground dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300">
            <span className="flex shrink-0 items-center gap-1 font-semibold text-primary">
              <Sparkles className="size-3" />
              AI 추천:
            </span>
            <button
              type="button"
              onClick={() => {
                if (onAcceptTitleSuggestion) {
                  onAcceptTitleSuggestion(title);
                } else {
                  onTitleChange(`${title}${formattedTitleSuggestion}`);
                  onDismissTitleSuggestion?.();
                }
              }}
              className="cursor-pointer truncate text-left transition-colors hover:text-foreground hover:underline"
              title="클릭하여 추천 제목 적용 (단축키: Tab)"
            >
              &ldquo;{title}
              {formattedTitleSuggestion}&rdquo;
            </button>
            <PostEditorAiBadge label="Tab 적용" className="shrink-0" />
            <button
              type="button"
              onClick={onDismissTitleSuggestion}
              className="ml-auto shrink-0 text-[11px] text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100"
              title="추천 닫기 (단축키: Esc)"
            >
              닫기
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
