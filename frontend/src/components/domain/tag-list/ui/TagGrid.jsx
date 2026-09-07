import TagCard from "./TagCard";

export default function TagGrid({
  tags,
  hasMore,
  isLoadingMore,
  normalizedKeyword,
  keyword,
  totalCount,
  observerRef,
}) {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-[10px]">
        {tags.map((tag) => (
          <TagCard key={tag.name} tag={tag} />
        ))}
      </div>

      {normalizedKeyword && totalCount === 0 && (
        <p className="py-10 text-center text-[13px] text-muted-foreground">
          &ldquo;{keyword.trim()}&rdquo;에 해당하는 태그가 없습니다.
        </p>
      )}

      {hasMore && (
        <div
          ref={observerRef}
          className="flex h-20 items-center justify-center text-[13px] text-muted-foreground"
        >
          {isLoadingMore ? "더 불러오는 중..." : ""}
        </div>
      )}

      {!hasMore && totalCount > 0 && (
        <p className="py-10 text-center text-[13px] text-muted-foreground">
          모든 태그를 불러왔습니다.
        </p>
      )}
    </>
  );
}
