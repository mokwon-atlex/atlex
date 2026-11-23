import { useRef } from 'react';
import { Sparkles } from 'lucide-react';
import PostEditorTagFieldSection from '@/components/domain/post-editor/layout/PostEditorTagFieldSection';
import PostEditorAiBadge from '@/components/domain/post-editor/ui/PostEditorAiBadge';

export default function PostEditorTitleSection({
  title,
  titlePlaceholder,
  onTitleChange,
  tagPlaceholder,
  tagField,
  titleSuggestion = '',
  isSuggestingTitle = false,
  onAcceptTitleSuggestion,
  onDismissTitleSuggestion,
  onRequestTitleSuggestion,
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
    <section className="mx-auto w-full max-w-4xl px-5 pt-8 pb-4 sm:px-8 sm:pt-10">
      <div className="relative">
        <input
          ref={inputRef}
          id="post-editor-title"
          aria-label="제목"
          type="text"
          value={title}
          placeholder={titlePlaceholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={syncScroll}
          className="w-full border-0 bg-transparent px-0 py-1.5 text-3xl font-extrabold tracking-tight text-foreground placeholder:text-muted-foreground/45 focus:outline-none sm:text-4xl"
        />

        {titleSuggestion ? (
          <div
            ref={overlayRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center overflow-hidden px-0 py-1.5 text-3xl font-extrabold tracking-tight select-none sm:text-4xl"
          >
            <span className="invisible whitespace-pre">{title}</span>
            <span className="whitespace-pre text-muted-foreground/45">{formattedTitleSuggestion}</span>
            <PostEditorAiBadge label="Tab" className="ml-2 shrink-0" />
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="h-1 w-14 rounded-full bg-foreground/75" aria-hidden="true" />
        {isSuggestingTitle ? (
          <span className="inline-flex animate-pulse items-center gap-1 text-xs text-muted-foreground/80">
            <Sparkles className="size-3 animate-spin text-primary" />
            <span>AI 제목 추천 중...</span>
          </span>
        ) : null}
      </div>

      {titleSuggestion ? (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="flex shrink-0 items-center gap-1 font-medium text-primary">
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
            className="ml-auto shrink-0 text-[11px] text-muted-foreground/60 hover:text-foreground"
            title="추천 닫기 (단축키: Esc)"
          >
            닫기
          </button>
        </div>
      ) : null}

      <div className="mt-4">
        <PostEditorTagFieldSection tagField={tagField} tagPlaceholder={tagPlaceholder} />
      </div>
    </section>
  );
}
