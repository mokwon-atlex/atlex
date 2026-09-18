import { useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { Field, FieldLabel } from '@/components/common/ui/field';
import { Input } from '@/components/common/ui/input';
import PostEditorTagFieldSection from '@/components/domain/post-editor/layout/PostEditorTagFieldSection';
import PostEditorAiBadge from '@/components/domain/post-editor/ui/PostEditorAiBadge';

const TITLE_LABEL = '제목';

export default function PostEditorTitleSection({
  title,
  titlePlaceholder,
  onTitleChange,
  tagPlaceholder,
  tagField, // usePostEditorTags 훅이 반환하는 객체 전체를 그대로 전달
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

  const handleKeyDown = (event) => {
    if (event.nativeEvent?.isComposing) return;

    if (event.key === 'Tab' && titleSuggestion) {
      event.preventDefault();
      if (onAcceptTitleSuggestion) {
        onAcceptTitleSuggestion(title);
      } else {
        onTitleChange(`${title}${titleSuggestion}`);
        onDismissTitleSuggestion?.();
      }
    } else if (event.key === 'Escape' && titleSuggestion) {
      event.preventDefault();
      onDismissTitleSuggestion?.();
    }
  };

  return (
    <section className="border-b border-border">
      <div className="px-5 py-6 sm:px-7">
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="post-editor-title" className="text-sm font-semibold text-muted-foreground">
              {TITLE_LABEL}
            </FieldLabel>
            {isSuggestingTitle ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/80 animate-pulse">
                <Sparkles className="size-3 text-primary animate-spin" />
                <span>AI 추천 중...</span>
              </span>
            ) : null}
          </div>

          <div className="relative">
            <Input
              ref={inputRef}
              id="post-editor-title"
              type="text"
              variant="filled"
              size="lg"
              value={title}
              placeholder={titlePlaceholder}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onScroll={syncScroll}
              className="text-lg font-semibold"
            />

            {titleSuggestion ? (
              <div
                ref={overlayRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center border border-transparent px-3 text-lg font-semibold overflow-hidden select-none"
              >
                <span className="invisible whitespace-pre">{title}</span>
                <span className="text-muted-foreground/50 whitespace-pre">{titleSuggestion}</span>
                <PostEditorAiBadge label="Tab" className="shrink-0" />
              </div>
            ) : null}
          </div>

          {titleSuggestion ? (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-primary shrink-0">
                <Sparkles className="size-3" />
                AI 추천:
              </span>
              <button
                type="button"
                onClick={() => {
                  if (onAcceptTitleSuggestion) {
                    onAcceptTitleSuggestion(title);
                  } else {
                    onTitleChange(`${title}${titleSuggestion}`);
                    onDismissTitleSuggestion?.();
                  }
                }}
                className="cursor-pointer truncate text-left hover:underline hover:text-foreground transition-colors"
                title="클릭하여 추천 제목 적용 (단축키: Tab)"
              >
                &ldquo;{title}
                {titleSuggestion}&rdquo;
              </button>
              <PostEditorAiBadge label="Tab 적용" className="shrink-0" />
              <button
                type="button"
                onClick={onDismissTitleSuggestion}
                className="ml-auto shrink-0 text-muted-foreground/60 hover:text-foreground text-[11px]"
                title="추천 닫기 (단축키: Esc)"
              >
                닫기
              </button>
            </div>
          ) : null}
        </Field>
      </div>

      <PostEditorTagFieldSection tagField={tagField} tagPlaceholder={tagPlaceholder} />
    </section>
  );
}
