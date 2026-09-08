import { Lock } from 'lucide-react';

import { Capsule } from '@/components/common/ui/capsule';
import { Textfield, textfieldVariants } from '@/components/common/ui/textfield';
import { cn } from '@/lib/utils';

const titleClampStyle = {
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
};

const excerptClampStyle = {
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 3,
  overflow: 'hidden',
};

export default function BlogHomeFeedItemContentLayout({ category, excerpt, isPrivate = false, tags = [], title }) {
  // 비공개일 때만 배지를 띄우고, 카테고리명이 있을 때만 라벨로 보여준다.
  const hasCategory = Boolean(category);
  const showMeta = isPrivate || hasCategory;

  return (
    <>
      {showMeta ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {isPrivate ? (
            <Capsule
              size="sm"
              className="gap-1 rounded-full border-transparent bg-muted px-2.5 py-1 text-muted-foreground hover:bg-muted"
            >
              <Lock className="size-3.5" />
              비공개
            </Capsule>
          ) : null}

          {hasCategory ? (
            <Textfield className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {category}
            </Textfield>
          ) : null}
        </div>
      ) : null}

      <h3
        className={cn(
          textfieldVariants({
            size: 'xl',
            weight: 'bold',
          }),
          'leading-snug tracking-tight md:text-2xl',
        )}
        style={titleClampStyle}
      >
        {title}
      </h3>

      <Textfield variant="muted" size="sm" className="mt-3 leading-6" style={excerptClampStyle}>
        {excerpt}
      </Textfield>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Capsule
            key={tag}
            variant="outline"
            className="bg-background px-3 py-1 text-xs font-semibold text-muted-foreground hover:bg-background"
          >
            {tag}
          </Capsule>
        ))}
      </div>
    </>
  );
}
