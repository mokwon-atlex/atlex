'use client';

import { Check, LoaderCircle } from 'lucide-react';

import { Button } from '@/components/common/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/common/ui/card';
import { BLOG_SKINS } from '@/lib/blog-option';
import { cn } from '@/lib/utils';

/** 스킨별 화면 구조를 보여 주는 작은 와이어프레임. 강조 칸은 글 영역이다. */
function SkinWireframe({ skinId }) {
  const cell = 'rounded-[3px] bg-border';
  const accent = 'rounded-[3px] bg-primary/50';

  if (skinId === 'MAGAZINE') {
    return (
      <div className="grid h-full grid-cols-3 grid-rows-[1.4fr_1fr_0.7fr] gap-1">
        <i className={cn(accent, 'col-span-3')} />
        <i className={cell} />
        <i className={cell} />
        <i className={cell} />
        <i className={cn(cell, 'col-span-3 opacity-70')} />
      </div>
    );
  }

  if (skinId === 'MINIMAL') {
    return (
      <div className="flex h-full flex-col items-center gap-1">
        <i className="size-4 shrink-0 rounded-full bg-border" />
        <i className={cn(accent, 'h-1.5 w-3/5')} />
        <i className={cn(cell, 'h-1.5 w-3/5')} />
        <i className={cn(cell, 'h-1.5 w-3/5')} />
        <i className={cn(cell, 'h-1.5 w-3/5')} />
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-[1fr_2.4fr] grid-rows-3 gap-1">
      <i className={cn(cell, 'row-span-3')} />
      <i className={accent} />
      <i className={cell} />
      <i className={cell} />
    </div>
  );
}

/**
 * 블로그 홈 스킨을 고르는 블로그 옵션 섹션이다.
 *
 * @param {Object} props
 * @param {string} props.blogSkin 현재 선택한 스킨 id
 * @param {string} props.savedBlogSkin 서버에 저장된 스킨 id
 * @param {(skinId: string) => void} props.onBlogSkinChange 스킨 선택 처리기
 * @param {() => void} props.onSave 저장 처리기
 */
export default function BlogOptionSkinPicker({
  blogSkin,
  savedBlogSkin,
  isLoading = false,
  isSaving = false,
  errorMessage = '',
  noticeMessage = '',
  onBlogSkinChange,
  onSave,
}) {
  const isDisabled = isLoading || isSaving;
  const isChanged = blogSkin !== savedBlogSkin;

  return (
    <Card className="rounded-[2rem] border-border/60 bg-card/80 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle>블로그 스킨</CardTitle>
        <CardDescription>내 블로그 홈의 화면 구성을 고릅니다. 방문자에게도 같은 스킨으로 보입니다.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div role="radiogroup" aria-label="블로그 스킨" className="grid gap-3 sm:grid-cols-3">
          {BLOG_SKINS.map((skin) => {
            const isSelected = skin.id === blogSkin;

            return (
              <button
                key={skin.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={isDisabled}
                onClick={() => onBlogSkinChange(skin.id)}
                className={cn(
                  'relative flex flex-col gap-3 rounded-2xl border bg-background/60 p-3 text-left transition-[border-color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] disabled:opacity-60',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isSelected
                    ? 'border-primary shadow-[0_0_0_1px_var(--primary)]'
                    : 'border-border hover:border-foreground/25',
                )}
              >
                <div className="h-20 rounded-xl bg-muted/60 p-2" aria-hidden="true">
                  <SkinWireframe skinId={skin.id} />
                </div>
                <div className="space-y-1">
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    {skin.name}
                    {skin.id === savedBlogSkin ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        사용 중
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs leading-5 text-muted-foreground [word-break:keep-all]">{skin.description}</p>
                </div>
                {isSelected ? (
                  <Check className="absolute top-3 right-3 size-4 text-primary" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>

        {errorMessage ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {errorMessage}
          </p>
        ) : null}
        {noticeMessage ? <p className="text-sm font-medium text-foreground/80">{noticeMessage}</p> : null}
      </CardContent>

      <CardFooter className="justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isDisabled || !isChanged}
          onClick={() => onBlogSkinChange(savedBlogSkin)}
        >
          되돌리기
        </Button>
        <Button type="button" disabled={isDisabled || !isChanged} onClick={onSave}>
          {isSaving ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              저장 중
            </>
          ) : (
            '저장'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
