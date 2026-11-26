// [Section] 게시 메타 입력 — 설명(description) · 태그 · 카테고리 · 공개 여부(isPublic) · 대표 이미지.
// 모든 값/핸들러를 props 로 받는 controlled 컴포넌트. 상태는 상위(page.jsx)에서 관리한다.
import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, ImageOff, Loader2, Plus, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { Field, FieldLabel } from '@/components/common/ui/field';
import { Input } from '@/components/common/ui/input';
import { Switch } from '@/components/common/ui/switch';
import { Textarea } from '@/components/common/ui/textarea';
import PostEditorTagFieldSection from '@/components/domain/post-editor/layout/PostEditorTagFieldSection';
import { postEditorCategories } from '@/data/post-editor/post-editor-categories';

const LABEL_CLASS = 'text-sm font-semibold text-foreground/85 dark:text-zinc-200';

export default function PostEditorMetaSection({
  description,
  onDescriptionChange,
  categoryId, // null | number
  categories = [],
  onCategoryChange,
  onCreateCategory, // (name: string) => Promise<void>
  isPublic,
  onIsPublicChange,
  isGeneratingDescription = false,
  onRequestGenerateDescription,
  images = [],
  selectedThumbnailUrl = null,
  onSelectThumbnail,
  tagField = null,
  tagPlaceholder = '',
  embedded = false,
}) {
  const categoryOptions = [postEditorCategories[0], ...categories];
  const [isOpen, setIsOpen] = useState(embedded);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  const selectedCategoryName =
    categoryOptions.find((item) => String(item.id ?? '') === String(categoryId ?? ''))?.name ?? '미분류';

  async function handleSubmitNewCategory() {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setCategoryError('카테고리 이름을 입력해 주세요.');
      return;
    }

    setIsCreatingCategory(true);
    setCategoryError('');
    try {
      await onCreateCategory?.(trimmed);
      setNewCategoryName('');
      setIsAddingCategory(false);
    } catch (error) {
      setCategoryError(error?.message ?? '카테고리 추가에 실패했습니다.');
    } finally {
      setIsCreatingCategory(false);
    }
  }

  const contentBody = (
    <div
      className={
        embedded ? 'grid gap-5' : 'grid gap-6 border-t border-border px-5 py-6 sm:px-7 dark:border-zinc-700/90'
      }
    >
      {/* 설명 (optional) */}
      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor="post-editor-description" className={LABEL_CLASS}>
            설명 (선택)
          </FieldLabel>
          {onRequestGenerateDescription ? (
            <button
              type="button"
              onClick={onRequestGenerateDescription}
              disabled={isGeneratingDescription}
              className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline disabled:opacity-50 disabled:no-underline"
              title="본문 내용을 분석하여 1~2문장의 메타 설명을 자동 생성합니다"
            >
              {isGeneratingDescription ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
              <span>{isGeneratingDescription ? 'AI 요약 중...' : 'AI 요약 생성'}</span>
            </button>
          ) : null}
        </div>
        <Textarea
          id="post-editor-description"
          variant="filled"
          value={description}
          placeholder="목록·카드에 노출될 짧은 설명을 입력하세요."
          onChange={(event) => onDescriptionChange(event.target.value)}
          className="border border-border dark:border-zinc-600 dark:bg-zinc-900/70 dark:text-zinc-100 dark:placeholder:text-zinc-400"
        />
      </Field>

      {/* 태그 입력 (발행 설정 모달에서 설명·카테고리와 함께 관리한다) */}
      {tagField ? <PostEditorTagFieldSection embedded tagField={tagField} tagPlaceholder={tagPlaceholder} /> : null}

      <div className="flex flex-wrap items-end justify-between gap-6">
        {/* 카테고리 */}
        <Field className="max-w-md flex-1">
          <FieldLabel htmlFor="post-editor-category" className={LABEL_CLASS}>
            카테고리
          </FieldLabel>
          <div className="flex flex-wrap items-center gap-2">
            <select
              id="post-editor-category"
              value={categoryId ?? ''}
              onChange={(event) => {
                const { value } = event.target;
                const nextCategoryId = Number(value);
                onCategoryChange(value === '' || !Number.isFinite(nextCategoryId) ? null : nextCategoryId);
              }}
              className="h-10 min-w-44 flex-1 rounded-lg border border-border bg-muted px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-zinc-600 dark:bg-zinc-900"
            >
              {categoryOptions.map((category) => (
                <option key={category.id ?? 'none'} value={category.id ?? ''}>
                  {category.name}
                </option>
              ))}
            </select>

            {onCreateCategory && !isAddingCategory ? (
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => {
                  setCategoryError('');
                  setIsAddingCategory(true);
                }}
                className="h-10 shrink-0 gap-1 dark:border-zinc-600"
              >
                <Plus className="size-4" />
                추가
              </Button>
            ) : null}
          </div>

          {onCreateCategory && isAddingCategory ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmitNewCategory();
                  } else if (e.key === 'Escape') {
                    setIsAddingCategory(false);
                    setCategoryError('');
                  }
                }}
                placeholder="새 카테고리 이름"
                disabled={isCreatingCategory}
                aria-label="새 카테고리 이름"
                className="h-9 min-w-40 flex-1 dark:border-zinc-600"
                autoFocus
              />
              <Button
                type="button"
                size="sm"
                disabled={isCreatingCategory || !newCategoryName.trim()}
                onClick={handleSubmitNewCategory}
              >
                {isCreatingCategory ? <Loader2 className="size-3.5 animate-spin" /> : '저장'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isCreatingCategory}
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                  setCategoryError('');
                }}
                aria-label="카테고리 추가 취소"
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : null}

          {categoryError ? (
            <p role="alert" className="mt-1.5 text-xs text-destructive">
              {categoryError}
            </p>
          ) : null}
        </Field>

        {/* 공개 여부 */}
        <Field orientation="horizontal" className="w-auto items-center gap-3">
          <FieldLabel htmlFor="post-editor-public" className={LABEL_CLASS}>
            {isPublic ? '공개' : '비공개'}
          </FieldLabel>
          <Switch id="post-editor-public" checked={isPublic} onCheckedChange={onIsPublicChange} />
        </Field>
      </div>

      {/* 본문에 이미지가 1개 이상 있으면 대표 이미지 선택 UI를 노출한다. */}
      {images.length > 0 && onSelectThumbnail ? (
        <Field>
          <div className="flex items-center justify-between gap-2">
            <FieldLabel className={LABEL_CLASS}>대표 이미지</FieldLabel>
            <span className="text-xs text-muted-foreground dark:text-zinc-300">
              {images.length > 1
                ? '목록 카드에 표시할 기본 이미지를 선택하세요.'
                : '목록 카드에 표시되는 기본 이미지입니다.'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {images.map((src, index) => {
              const isSelected = selectedThumbnailUrl === src;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => onSelectThumbnail(src)}
                  aria-label={`대표 이미지 ${index + 1} 선택`}
                  aria-pressed={isSelected}
                  className={`relative h-16 w-24 cursor-pointer overflow-hidden rounded-lg border transition-all ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/40'
                      : 'border-border opacity-80 hover:opacity-100 dark:border-zinc-600'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`대표 이미지 후보 ${index + 1}`} className="h-full w-full object-cover" />
                  {isSelected ? (
                    <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                      <Check className="size-3" />
                    </span>
                  ) : null}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => onSelectThumbnail(null)}
              aria-pressed={selectedThumbnailUrl === null}
              className={`inline-flex h-16 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all ${
                selectedThumbnailUrl === null
                  ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/30'
                  : 'border-border bg-muted/50 text-muted-foreground hover:bg-muted dark:border-zinc-600 dark:text-zinc-300'
              }`}
            >
              <ImageOff className="size-3.5" />
              <span>선택 안 함</span>
            </button>
          </div>
        </Field>
      ) : null}
    </div>
  );

  if (embedded) {
    return (
      <section className="rounded-xl border border-border bg-muted/20 p-5 dark:border-zinc-700/90 dark:bg-zinc-900/40">
        {contentBody}
      </section>
    );
  }

  return (
    <section className="border-t border-border bg-muted/15 dark:border-zinc-700/90">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors hover:bg-muted/30 sm:px-7"
      >
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-foreground">발행 설정</span>
          <span className="text-xs text-muted-foreground dark:text-zinc-300">
            · {selectedCategoryName} · {isPublic ? '전체 공개' : '비공개'}
            {description?.trim() ? ' · 설명 입력됨' : ''}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground dark:text-zinc-300">
          {isOpen ? (
            <>
              <span>접기</span>
              <ChevronUp className="size-4" />
            </>
          ) : (
            <>
              <span>설정 열기</span>
              <ChevronDown className="size-4" />
            </>
          )}
        </span>
      </button>

      {isOpen && contentBody}
    </section>
  );
}
