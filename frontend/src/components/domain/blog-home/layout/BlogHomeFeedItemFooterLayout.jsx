import { Bookmark, Heart, MessageSquare } from 'lucide-react';

import { Button } from '@/components/common/ui/button';
import { Separator } from '@/components/common/ui/separator';
import { Textfield } from '@/components/common/ui/textfield';
import { cn } from '@/lib/utils';

/**
 * 피드 카드 하단의 반응 버튼이다.
 *
 * @param {Object} props
 * @param {boolean} [props.active=false] 현재 사용자가 반응한 상태인지 여부
 * @param {boolean} [props.disabled=false] 클릭을 막을지 여부
 * @param {() => void} [props.onClick] 클릭 처리기. 토글 버튼일 때만 전달한다
 */
function ReactionButton({ active = false, disabled = false, icon: Icon, label, onClick, value }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="xs"
      aria-label={`${label} ${value}`}
      // 토글 동작이 있는 버튼만 눌림 상태를 보조기기에 알린다.
      aria-pressed={onClick ? active : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'h-auto rounded-full px-3 py-1 text-xs font-semibold',
        active
          ? 'border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive'
          : 'text-muted-foreground',
      )}
    >
      <Icon className={cn('size-3.5', active && 'fill-current')} />
      {value}
    </Button>
  );
}

/**
 * 피드 카드 하단의 날짜와 반응 버튼 영역이다.
 *
 * @param {Object} props
 * @param {boolean} [props.isLikeDisabled=false] 좋아요 상태 확인 전이거나 요청 중이라 토글을 막을지 여부
 * @param {() => void} [props.onLikeToggle] 좋아요 버튼 클릭 처리기
 */
export default function BlogHomeFeedItemFooterLayout({
  bookmarks = 0,
  comments = 0,
  date,
  isLikeDisabled = false,
  isLiked = false,
  likes = 0,
  onLikeToggle,
}) {
  return (
    <div className="mt-5 space-y-4">
      <Separator />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Textfield className="text-xs font-semibold text-muted-foreground">{date}</Textfield>

        <div className="flex flex-wrap items-center gap-2">
          <ReactionButton
            active={isLiked}
            disabled={isLikeDisabled}
            icon={Heart}
            label="like"
            onClick={onLikeToggle}
            value={likes}
          />
          <ReactionButton icon={MessageSquare} label="comment" value={comments} />
          <ReactionButton icon={Bookmark} label="bookmark" value={bookmarks} />
        </div>
      </div>
    </div>
  );
}
