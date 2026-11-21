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

  if (skinId === 'MINIMAL') {
    return (
      <div className="grid h-full grid-cols-2 grid-rows-[1.2fr_1fr] gap-1">
        <i className={cell} />
        <i className={cell} />
        <div className="col-span-2 flex flex-col justify-center gap-1">
          <i className={cn(accent, 'h-1.5 w-full')} />
          <i className={cn(cell, 'h-1.5 w-4/5')} />
        </div>
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
 * @param {string | null} props.blogSkin 현재 선택한 스킨 id
 * @param {string | null} props.savedBlogSkin 서버에 저장된 스킨 id. 아직 불러오지 못했으면 null
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
  // 저장된 스킨을 모르는 상태(불러오는 중·실패)에서는 사용 중 표시와 편집을 막는다.
  const isLoaded = savedBlogSkin != null;
  const isDisabled = isLoading || isSaving || !isLoaded;
  const isChanged = blogSkin !== savedBlogSkin;

  return (
    <Card className="rounded-[2rem] border-border/60 bg-card/80 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle>블로그 스킨</CardTitle>
        <CardDescription>내 블로그 홈의 화면 구성을 고릅니다. 방문자에게도 같은 스킨으로 보입니다.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 기본 radio 입력을 써서 방향키 선택과 Tab 진입·이탈을 브라우저 동작 그대로 제공한다. */}
        <div role="radiogroup" aria-label="블로그 스킨" className="grid gap-3 sm:grid-cols-2">
          {BLOG_SKINS.map((skin) => {
            const isSelected = skin.id === blogSkin;
            const descriptionId = `blog-skin-${skin.id}-description`;

            return (
              <label
                key={skin.id}
                className={cn(
                  'relative flex cursor-pointer flex-col gap-3 rounded-lg border bg-background/60 p-3 text-left transition-colors duration-150',
                  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60',
                  isSelected
                    ? 'border-primary shadow-[0_0_0_1px_var(--primary)]'
                    : 'border-border/80 hover:border-foreground/25',
                )}
              >
                <input
                  type="radio"
                  name="blog-skin"
                  value={skin.id}
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => onBlogSkinChange(skin.id)}
                  aria-label={skin.name}
                  aria-describedby={descriptionId}
                  className="sr-only"
                />
                <div className="h-20 rounded-md bg-muted/60 p-2" aria-hidden="true">
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
                  <p id={descriptionId} className="text-xs leading-5 text-muted-foreground [word-break:keep-all]">
                    {skin.description}
                  </p>
                </div>
                {isSelected ? (
                  <Check className="absolute top-3 right-3 size-4 text-primary" aria-hidden="true" />
                ) : null}
              </label>
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
