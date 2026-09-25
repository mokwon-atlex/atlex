'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Heart, LoaderCircle, MessageSquare, Share2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/common/ui/button';
import { useComments } from '@/hooks/queries/comments/useComments';
import { usePostLike } from '@/hooks/queries/posts/usePostLike';
import { downloadPostMarkdown } from '@/lib/api/posts';

function ActionButton({ label, count, icon, onClick, disabled, pressed, 'aria-label': ariaLabel }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
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
  initialLiked = false,
  likes = 0,
  onCommentClick,
  postId,
}) {
  const { comments = [] } = useComments(postId);
  const commentCount = propComments ?? (postId ? comments.length : 0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [likeError, setLikeError] = useState(null);
  const {
    isLoggedIn,
    isLiked,
    likes: likeCount,
    isStateReady,
    stateError,
    retryLikeState,
    isPending: isLikePending,
    toggleLike,
  } = usePostLike(postId, { initialLiked, initialLikes: likes });

  const handleLikeClick = async () => {
    setLikeError(null);
    setNeedsLogin(false);
    if (!isLoggedIn) {
      setNeedsLogin(true);
      return;
    }

    try {
      await toggleLike();
    } catch (error) {
      setLikeError(error?.message ?? '좋아요 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

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
      <ActionButton
        label="Like"
        count={likeCount}
        icon={<Heart className={`size-3.5 ${isLiked ? 'fill-current text-foreground' : 'text-muted-foreground'}`} />}
        onClick={handleLikeClick}
        disabled={isLikePending || !isStateReady}
        pressed={isLiked}
        aria-label={isLiked ? '좋아요 취소하기' : '좋아요 하기'}
      />
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

      {needsLogin ? (
        <p role="alert" className="text-xs text-muted-foreground xl:w-full">
          좋아요는 로그인 후 사용할 수 있습니다.{' '}
          <Link href="/auth/login" className={buttonVariants({ variant: 'link', size: 'sm' })}>
            로그인하기
          </Link>
        </p>
      ) : null}

      {stateError ? (
        <p role="alert" className="text-xs text-destructive xl:w-full">
          좋아요 상태를 불러오지 못했습니다.{' '}
          <button type="button" onClick={() => retryLikeState()} className="font-semibold underline">
            다시 시도
          </button>
        </p>
      ) : null}

      {likeError ? (
        <p role="alert" className="text-xs text-destructive xl:w-full">
          {likeError}
        </p>
      ) : null}
    </div>
  );
}
