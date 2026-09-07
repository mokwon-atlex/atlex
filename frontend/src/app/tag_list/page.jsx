import { Suspense } from "react";
import TagListContent from "@/components/domain/tag-list/feature/TagListContent";

export default function TagListPage() {
  return (
    <Suspense fallback={null}>
      <TagListContent />
    </Suspense>
  );
}
