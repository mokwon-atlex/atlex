import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function TagCard({ tag }) {
  const encodedTagName = encodeURIComponent(tag.name);

  return (
    <Link
      href={`/tags/${encodedTagName}`}
      className={cn(
        'cursor-pointer rounded-lg border border-border/80 bg-card px-4 py-3 shadow-2xs',
        'text-card-foreground transition-colors',
        'hover:border-foreground/25 hover:bg-accent/50 hover:text-accent-foreground',
      )}
    >
      <p className="text-[15px] font-medium">{tag.name}</p>
      <p className="mt-1 text-[12px] text-muted-foreground tabular-nums">{tag.postCount.toLocaleString()}개의 포스트</p>
    </Link>
  );
}
