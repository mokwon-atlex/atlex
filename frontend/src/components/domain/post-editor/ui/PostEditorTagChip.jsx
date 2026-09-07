// [Atomic] 태그 칩 — 자동 태그(default)와 수동 태그(success) 두 가지 variant.
// onRemove가 있을 때는 삭제 가능한 버튼으로, 없을 때는 정적 Capsule로 렌더한다.
import { X } from "lucide-react";

import { Capsule, capsuleVariants } from "@/components/common/ui/capsule";
import { cn } from "@/lib/utils";

const CHIP_VARIANT = {
  manual: "success",    // 사용자가 직접 입력한 태그 — 초록 계열
  automatic: "default", // 본문 #해시태그에서 감지된 태그
};
const REMOVE_TAG_LABEL_SUFFIX = " 태그 삭제";

export default function PostEditorTagChip({
  label,
  onRemove, // 전달되면 삭제 버튼(X)이 붙은 <button>으로 렌더, 없으면 정적 <Capsule>
  variant = "automatic",
}) {
  const capsuleVariant = CHIP_VARIANT[variant] ?? "default";

  if (!onRemove) {
    return (
      <Capsule variant={capsuleVariant} size="lg" className="gap-1.5 px-4 py-2">
        {label}
      </Capsule>
    );
  }

  // Capsule은 div라서 button을 자식으로 넣으면 HTML이 깨진다.
  // 대신 capsuleVariants cva를 <button>에 직접 적용한다.
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={label + REMOVE_TAG_LABEL_SUFFIX}
      className={cn(
        capsuleVariants({ variant: capsuleVariant, size: "lg" }),
        "gap-1.5 px-4 py-2 cursor-pointer"
      )}
    >
      <span>{label}</span>
      <X className="h-3.5 w-3.5" />
    </button>
  );
}
