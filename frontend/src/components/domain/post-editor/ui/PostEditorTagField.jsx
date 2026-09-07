// [Group] 태그 입력 필드 — InputGroup 안에 태그 칩 목록 + 텍스트 입력을 인라인으로 배치한다.
import { Capsule } from "@/components/common/ui/capsule";
import { Field, FieldLabel } from "@/components/common/ui/field";
import {
  InputGroup,
  InputGroupInput,
} from "@/components/common/ui/input-group";
import { Textfield, textfieldVariants } from "@/components/common/ui/textfield";
import PostEditorTagChip from "@/components/domain/post-editor/ui/PostEditorTagChip";
import { cn } from "@/lib/utils";

const BODY_TAG_HELPER_PREFIX = "본문의 ";
const BODY_TAG_HELPER_SUFFIX = "도 자동으로 추가됩니다.";
const REGISTER_TAG_HELPER = "Enter를 누르면 태그가 등록됩니다.";
const TAG_LABEL = "태그";
const TAG_TOKEN = "#태그";

export default function PostEditorTagField({
  countLabel,
  detectedTagsLabel,
  inputPlaceholder,
  onTagInputChange,
  onTagInputKeyDown,
  tagInput,
  tags,
}) {
  return (
    <div className="border-t border-border px-5 py-5 sm:px-7">
      <Field>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FieldLabel
            htmlFor="post-editor-tag-input"
            className="text-sm font-semibold text-muted-foreground"
          >
            {TAG_LABEL}
          </FieldLabel>
          <Capsule variant="secondary" size="sm">
            {countLabel}
          </Capsule>
        </div>

        <InputGroup variant="filled" className="h-auto rounded-[22px] px-4 py-3">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <PostEditorTagChip
                key={tag.id}
                label={tag.label}
                onRemove={tag.onRemove}
                variant={tag.variant}
              />
            ))}

            <InputGroupInput
              id="post-editor-tag-input"
              type="text"
              value={tagInput}
              placeholder={inputPlaceholder}
              onChange={(event) => onTagInputChange(event.target.value)}
              onKeyDown={onTagInputKeyDown}
              className="min-w-[180px] flex-1 py-2 text-base"
            />
          </div>
        </InputGroup>

        <div className="flex flex-wrap items-center gap-3">
          <Textfield variant="muted" size="sm">
            {REGISTER_TAG_HELPER}
          </Textfield>
          {/* Textfield는 <p>이므로 Capsule(div)를 자식으로 넣을 수 없다.
              textfieldVariants cva를 div에 직접 적용해서 block 요소 중첩을 피한다. */}
          <div
            className={cn(
              textfieldVariants({ variant: "muted", size: "sm" }),
              "inline-flex flex-wrap items-center gap-1"
            )}
          >
            <span>{BODY_TAG_HELPER_PREFIX}</span>
            <Capsule variant="outline" size="sm" className="font-mono">
              {TAG_TOKEN}
            </Capsule>
            <span>{BODY_TAG_HELPER_SUFFIX}</span>
          </div>
        </div>

        {detectedTagsLabel ? (
          <Textfield variant="muted" size="sm">
            {detectedTagsLabel}
          </Textfield>
        ) : null}
      </Field>
    </div>
  );
}
