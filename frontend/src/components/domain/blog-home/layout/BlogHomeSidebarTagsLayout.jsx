import {
  CardDescription,
  CardTitle,
} from "@/components/common/ui/card";
import BlogHomeSidebarCard from "@/components/domain/blog-home/layout/BlogHomeSidebarCard";
import BlogHomeTagChip from "@/components/domain/blog-home/ui/BlogHomeTagChip";

const defaultTitle = "태그";
const defaultDescription =
  "글 목록에서 쓰는 태그들을 한 번에 훑어볼 수 있게 둔 영역이다.";

export default function BlogHomeSidebarTagsLayout({
  description = defaultDescription,
  onTagSelect,
  tags,
  title = defaultTitle,
}) {
  return (
    <BlogHomeSidebarCard>
      <div className="space-y-1">
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        <CardDescription className="leading-6">{description}</CardDescription>
      </div>

      {/* 좁은 사이드바 카드 폭에 맞춰 태그를 세로로 쌓아 보여준다. */}
      <div className="mt-5 flex flex-col items-start gap-3">
        {tags.map((tag) => (
          <BlogHomeTagChip
            key={tag.id}
            active={tag.active}
            count={tag.count}
            label={tag.label}
            onClick={() => onTagSelect?.(tag.id)}
          />
        ))}
      </div>
    </BlogHomeSidebarCard>
  );
}
