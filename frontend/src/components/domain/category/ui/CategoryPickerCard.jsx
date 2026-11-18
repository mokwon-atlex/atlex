import { FolderOpen } from 'lucide-react';

import { Card, CardContent } from '@/components/common/ui/card';
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
  return (
    <button
      type="button"
      onClick={() => onSelect?.(category.id)}
      className="w-full text-left focus-visible:outline-none"
    >
      <Card
        className={cn(
          'gap-0 overflow-hidden rounded-xl border bg-background py-0 shadow-none transition-all focus-within:ring-2 focus-within:ring-ring',
          selected ? 'border-primary ring-1 ring-primary/25' : 'border-border hover:border-foreground/30',
        )}
      >
        <CardContent className="flex items-center gap-3 px-4 py-5">
          <span
            className={cn(
              'inline-flex size-9 shrink-0 items-center justify-center rounded-lg border',
              selected
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border bg-muted/40 text-muted-foreground',
            )}
          >
            <FolderOpen className="size-4" />
          </span>
          <Textfield size="base" weight="bold" className="truncate text-foreground">
            {category.label}
          </Textfield>
        </CardContent>

        <CardContent className="border-t border-border/70 bg-muted/30 px-4 py-2.5">
          <Textfield size="xs" variant="muted" className="leading-5" style={metaClampStyle}>
            {getMetaText(category)}
          </Textfield>
        </CardContent>
      </Card>
    </button>
  );
}
