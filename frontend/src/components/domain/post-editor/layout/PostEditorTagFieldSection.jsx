// [Group] usePostEditorTags 훅 출력 → PostEditorTagField props 변환 어댑터.
// 훅이 반환하는 combinedTags(문자열 배열)를 TagField가 요구하는 객체 배열로 가공하고,
// 수동 태그에만 onRemove를 붙여서 자동 태그(본문 #해시)와 구분한다.
import PostEditorTagField from "@/components/domain/post-editor/ui/PostEditorTagField";

const DETECTED_TAGS_LABEL_PREFIX =
  "\uBCF8\uBB38\uC5D0\uC11C \uAC10\uC9C0\uB41C \uD0DC\uADF8: ";
const TAG_INPUT_PLACEHOLDER =
  "\uD0DC\uADF8\uB97C \uC785\uB825\uD558\uC138\uC694";

export default function PostEditorTagFieldSection({
  tagField,
  tagPlaceholder,
}) {
  const {
    bodyTags,
    combinedTags,
    manualTags,
    onRemoveTag,
    onTagInputChange,
    onTagInputKeyDown,
    tagInput,
  } = tagField;

  const manualTagSet = new Set(manualTags);
  const tags = combinedTags.map((tag) => {
    const isManualTag = manualTagSet.has(tag);

    return {
      id: tag,
      label: tag,
      onRemove: isManualTag ? () => onRemoveTag(tag) : undefined,
      variant: isManualTag ? "manual" : "automatic",
    };
  });

  return (
    <PostEditorTagField
      countLabel={"\uCD1D " + combinedTags.length + "\uAC1C"}
      detectedTagsLabel={
        bodyTags.length > 0
          ? DETECTED_TAGS_LABEL_PREFIX +
            bodyTags.map((tag) => "#" + tag).join(", ")
          : ""
      }
      inputPlaceholder={
        combinedTags.length === 0 ? tagPlaceholder : TAG_INPUT_PLACEHOLDER
      }
      onTagInputChange={onTagInputChange}
      onTagInputKeyDown={onTagInputKeyDown}
      tagInput={tagInput}
      tags={tags}
    />
  );
}
