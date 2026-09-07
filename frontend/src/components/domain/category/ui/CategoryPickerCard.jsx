import { Card, CardContent } from '@/components/common/ui/card';
import { Image } from '@/components/common/ui/image';
import { Textfield } from '@/components/common/ui/textfield';
import { cn } from '@/lib/utils';

const metaClampStyle = {
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 1,
  overflow: 'hidden',
};

function getLastUpdatedLabel(latestPost) {
  return latestPost?.date ?? '없음';
}

function getMetaText(category) {
  return `${category.postCount}개의 게시물 · 마지막 업데이트 ${getLastUpdatedLabel(category.latestPost)}`;
}

export default function CategoryPickerCard({ category, selected = false, onSelect }) {
  const imageIcon = category.thumbnailUrl ? (
    <img alt="" className="h-full w-full object-cover" src={category.thumbnailUrl} />
  ) : (
    <Textfield size="xl" weight="bold" className="text-foreground">
      이미지
    </Textfield>
  );

  return (
    <button
      type="button"
      onClick={() => onSelect?.(category.id)}
      className="w-full text-left focus-visible:outline-none"
    >
      <Card
        className={cn(
          'gap-0 overflow-hidden rounded-[8px] border bg-background py-0 shadow-none transition-all focus-within:ring-2 focus-within:ring-ring',
          selected ? 'border-primary/45 ring-1 ring-primary/20' : 'border-border hover:border-sky-200',
        )}
      >
        <CardContent className="p-3">
          <Image
            className="aspect-[4/3] h-auto w-full rounded-[4px] border border-sky-100 bg-muted/30 text-foreground"
            icon={imageIcon}
          />
        </CardContent>

        <CardContent className="border-t border-border/70 px-3 py-2">
          <Textfield size="sm" weight="semibold" className="text-foreground">
            {category.label}
          </Textfield>
        </CardContent>

        <CardContent className="border-t border-border/70 bg-sky-50/70 px-3 py-2">
          <Textfield size="xs" className="leading-5 text-foreground" style={metaClampStyle}>
            {getMetaText(category)}
          </Textfield>
        </CardContent>
      </Card>
    </button>
  );
}
