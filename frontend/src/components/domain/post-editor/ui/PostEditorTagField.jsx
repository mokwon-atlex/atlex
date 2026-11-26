// [Group] 태그 입력 필드 — InputGroup 안에 태그 칩 목록 + 텍스트 입력을 인라인으로 배치한다.
import { Capsule } from '@/components/common/ui/capsule';
import { Field, FieldLabel } from '@/components/common/ui/field';
import { InputGroup, InputGroupInput } from '@/components/common/ui/input-group';
import { Textfield, textfieldVariants } from '@/components/common/ui/textfield';
import PostEditorTagChip from '@/components/domain/post-editor/ui/PostEditorTagChip';
import { cn } from '@/lib/utils';

const BODY_TAG_HELPER_PREFIX = '본문의 ';
const BODY_TAG_HELPER_SUFFIX = '도 자동으로 추가됩니다.';
const REGISTER_TAG_HELPER = 'Enter를 누르면 태그가 등록됩니다.';
const TAG_LABEL = '태그';
const TAG_TOKEN = '#태그';

export default function PostEditorTagField({
  countLabel,
  detectedTagsLabel,
  embedded = false,
  inputPlaceholder,
  onTagInputChange,
  onTagInputKeyDown,
  tagInput,
  tags,
}) {
  return (
    <div className={embedded ? '' : 'border-t border-border px-5 py-5 sm:px-7 dark:border-zinc-700/90'}>
      <Field>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FieldLabel
            htmlFor="post-editor-tag-input"
            className="text-sm font-semibold text-foreground/85 dark:text-zinc-200"
          >
            {TAG_LABEL}
          </FieldLabel>
          <Capsule variant="secondary" size="sm">
            {countLabel}
          </Capsule>
        </div>

        <InputGroup
          variant="filled"
          className="h-auto rounded-xl border border-border px-3.5 py-2 dark:border-zinc-600 dark:bg-zinc-900/70"
        >
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <PostEditorTagChip key={tag.id} label={tag.label} onRemove={tag.onRemove} variant={tag.variant} />
            ))}

            <InputGroupInput
              id="post-editor-tag-input"
              type="text"
              value={tagInput}
              placeholder={inputPlaceholder}
              onChange={(event) => onTagInputChange(event.target.value)}
              onKeyDown={onTagInputKeyDown}
              className="min-w-[180px] flex-1 py-1.5 text-sm text-foreground placeholder:text-muted-foreground dark:placeholder:text-zinc-400"
            />
          </div>
        </InputGroup>

        <div className="flex flex-wrap items-center gap-3">
          <Textfield variant="muted" size="sm" className="dark:text-zinc-300">
            {REGISTER_TAG_HELPER}
          </Textfield>
          <div
            className={cn(
              textfieldVariants({ variant: 'muted', size: 'sm' }),
              'inline-flex flex-wrap items-center gap-1 dark:text-zinc-300',
            )}
          >
            <span>{BODY_TAG_HELPER_PREFIX}</span>
            <Capsule variant="outline" size="sm" className="font-mono dark:border-zinc-600 dark:text-zinc-200">
              {TAG_TOKEN}
            </Capsule>
            <span>{BODY_TAG_HELPER_SUFFIX}</span>
          </div>
        </div>

        {detectedTagsLabel ? (
          <Textfield variant="muted" size="sm" className="dark:text-zinc-300">
            {detectedTagsLabel}
          </Textfield>
        ) : null}
      </Field>
    </div>
  );
}
