// [Section] 제목 입력 + 태그 필드를 묶는 섹션.
// 제목은 Field/Input으로, 태그는 PostEditorTagFieldSection 어댑터를 통해 렌더한다.
import { Field, FieldLabel } from "@/components/common/ui/field";
import { Input } from "@/components/common/ui/input";
import PostEditorTagFieldSection from "@/components/domain/post-editor/layout/PostEditorTagFieldSection";

const TITLE_LABEL = "제목";

export default function PostEditorTitleSection({
  title,
  titlePlaceholder,
  onTitleChange,
  tagPlaceholder,
  tagField, // usePostEditorTags 훅이 반환하는 객체 전체를 그대로 전달
}) {
  return (
    <section className="border-b border-border">
      <div className="px-5 py-6 sm:px-7">
        <Field>
          <FieldLabel
            htmlFor="post-editor-title"
            className="text-sm font-semibold text-muted-foreground"
          >
            {TITLE_LABEL}
          </FieldLabel>
          <Input
            id="post-editor-title"
            type="text"
            variant="filled"
            size="lg"
            value={title}
            placeholder={titlePlaceholder}
            onChange={(event) => onTitleChange(event.target.value)}
            className="text-lg font-semibold"
          />
        </Field>
      </div>

      <PostEditorTagFieldSection
        tagField={tagField}
        tagPlaceholder={tagPlaceholder}
      />
    </section>
  );
}
