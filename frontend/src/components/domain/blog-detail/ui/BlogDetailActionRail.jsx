'use client';

import { useState } from 'react';
import { Bookmark, Loader2, Share2 } from 'lucide-react';

import { Button } from '@/components/common/ui/button';
import { FavoriteValidationError, usePostFavorite } from '@/hooks/queries/posts/usePostFavorite';
import { cn } from '@/lib/utils';

/**
 * 액션 버튼 단일 아이템 컴포넌트입니다.
 *
 * @param {Object} props
 * @param {string} props.label - 버튼 라벨
 * @param {number} [props.count] - 숫자 표시
 * @param {React.ReactNode} [props.icon] - 아이콘 요소
 * @param {boolean} [props.active=false] - 활성화 상태 여부
 * @param {boolean} [props.disabled=false] - 비활성화 여부
 * @param {() => void} [props.onClick] - 클릭 핸들러
 * @param {string} [props['aria-label']] - 접근성 라벨
 */
function ActionButton({ label, count, icon, active = false, disabled = false, onClick, 'aria-label': ariaLabel }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'w-auto justify-between rounded-full gap-3 px-4 xl:w-full transition-colors',
        active && 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
      )}
    >
      <span
        className={cn(
          'text-[0.6rem] font-semibold uppercase tracking-[0.2em]',
          active ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        {label}
      </span>
      {count != null && (
        <span className={cn('text-sm font-bold tabular-nums', active ? 'text-primary' : 'text-foreground')}>
          {count}
        </span>
      )}
      {icon}
    </Button>
  );
}

/**
 * 게시글 상세 화면의 액션 레일(좋아요, 즐겨찾기, 공유) 컴포넌트입니다.
 *
 * @param {Object} props
 * @param {number|string} [props.postId] - 게시글 ID
 * @param {number} [props.bookmarks=7] - 즐겨찾기 수 기본값
 * @param {number} [props.likes=18] - 좋아요 수
 * @param {boolean} [props.isFavorited] - 외부 제어 즐겨찾기 여부 (Storybook/테스트용)
 * @param {boolean} [props.isLoading] - 외부 제어 로딩 여부 (Storybook/테스트용)
 * @param {() => void} [props.onSaveClick] - 외부 제어 클릭 핸들러 (Storybook/테스트용)
 */
export default function BlogDetailActionRail({
  postId,
  bookmarks = 7,
  likes = 18,
  isFavorited: controlledFavorited,
  isLoading: controlledLoading,
  onSaveClick: controlledOnSaveClick,
}) {
  const [errorMessage, setErrorMessage] = useState('');
  const [localBookmarksDelta, setLocalBookmarksDelta] = useState(0);

  const favoriteHook = usePostFavorite(postId);

  const isControlled = controlledFavorited !== undefined || controlledLoading !== undefined;
  const isFavorited = controlledFavorited !== undefined ? controlledFavorited : favoriteHook.isFavorited;
  const isPending = controlledLoading !== undefined ? Boolean(controlledLoading) : favoriteHook.isPending;
  const isLoggedIn = favoriteHook.isLoggedIn;

  /**
   * Save(즐겨찾기) 버튼 클릭 핸들러입니다.
   * 비로그인 시 오류 메시지를 안내하고, 로그인 상태인 경우 서버 토글을 수행합니다.
   */
  async function handleSaveClick() {
    setErrorMessage('');

    if (controlledOnSaveClick) {
      controlledOnSaveClick();
      return;
    }

    if (!isLoggedIn) {
      setErrorMessage('로그인이 필요합니다.');
      return;
    }

    try {
      const result = await favoriteHook.toggleFavorite();
      setLocalBookmarksDelta((prev) => (result.favorited ? prev + 1 : prev - 1));
    } catch (err) {
      if (err instanceof FavoriteValidationError || err?.isValidationError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('즐겨찾기 처리에 실패했습니다.');
      }
    }
  }

  const displayBookmarks = Math.max(0, bookmarks + localBookmarksDelta);

  return (
    <div className="flex flex-wrap gap-2 xl:w-fit xl:flex-col">
      <ActionButton label="Like" count={likes} />
      <ActionButton
        label="Save"
        count={displayBookmarks}
        active={isFavorited}
        disabled={isPending}
        onClick={handleSaveClick}
        aria-label={isFavorited ? '즐겨찾기 해제' : '즐겨찾기 저장'}
        icon={
          isPending ? (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" data-testid="save-loading-spinner" />
          ) : (
            <Bookmark className={cn('size-3.5', isFavorited ? 'fill-primary text-primary' : 'text-muted-foreground')} />
          )
        }
      />
      <ActionButton label="Share" icon={<Share2 className="size-3.5 text-muted-foreground" />} />

      {errorMessage && (
        <p role="alert" className="text-xs font-medium text-destructive px-2 text-center xl:text-left">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
