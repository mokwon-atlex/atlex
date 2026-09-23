'use client';

import { useState } from 'react';
import { Download, LoaderCircle, MessageSquare, Share2 } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { useComments } from '@/hooks/queries/comments/useComments';
import { downloadPostMarkdown } from '@/lib/api/posts';

function ActionButton({ label, count, icon, onClick, 'aria-label': ariaLabel, disabled }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="w-auto justify-between rounded-full gap-3 px-4 xl:w-full"
    >
      <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      {count != null && <span className="text-sm font-bold tabular-nums text-foreground">{count}</span>}
      {icon}
    </Button>
  );
}

export default function BlogDetailActionRail({
  bookmarks = 7,
  comments: propComments,
  likes = 18,
  onCommentClick,
  postId,
}) {
  const { comments = [] } = useComments(postId);
  const commentCount = propComments ?? (postId ? comments.length : 0);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleScrollToComments = () => {
    if (onCommentClick) {
      onCommentClick();
      return;
    }
    const target = document.getElementById('comments');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDownloadMarkdown = async () => {
    if (!postId || isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadPostMarkdown(postId);
    } catch (err) {
      alert(err?.message ?? '마크다운 다운로드에 실패했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 xl:w-fit xl:flex-col">
      <ActionButton label="Like" count={likes} />
      <ActionButton label="Save" count={bookmarks} />
      <ActionButton
        label="Comment"
        count={commentCount}
        icon={<MessageSquare className="size-3.5 text-muted-foreground" />}
        onClick={handleScrollToComments}
        aria-label={`댓글 ${commentCount}개 확인하기`}
      />
      <ActionButton
        label=".MD"
        icon={
          isDownloading ? (
            <LoaderCircle className="size-3.5 animate-spin text-muted-foreground" />
          ) : (
            <Download className="size-3.5 text-muted-foreground" />
          )
        }
        onClick={handleDownloadMarkdown}
        disabled={isDownloading}
        aria-label="마크다운(.md) 파일 다운로드"
      />
      <ActionButton label="Share" icon={<Share2 className="size-3.5 text-muted-foreground" />} />
    </div>
  );
}
