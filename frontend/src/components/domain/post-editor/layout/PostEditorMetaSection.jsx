// [Section] 게시 메타 입력 — 설명(description) · 카테고리 · 공개 여부(isPublic).
// 모든 값/핸들러를 props 로 받는 controlled 컴포넌트. 상태는 상위(page.jsx)에서 관리한다.
import { Loader2, Sparkles } from 'lucide-react';
import { Field, FieldLabel } from '@/components/common/ui/field';
import { Textarea } from '@/components/common/ui/textarea';
import { Switch } from '@/components/common/ui/switch';
import { postEditorCategories } from '@/data/post-editor/post-editor-categories';

const LABEL_CLASS = 'text-sm font-semibold text-muted-foreground';

export default function PostEditorMetaSection({
  description,
  onDescriptionChange,
  categoryId, // null | number
  categories = [],
  onCategoryChange,
  isPublic,
  onIsPublicChange,
  isGeneratingDescription = false,
  onRequestGenerateDescription,
}) {
  const categoryOptions = [postEditorCategories[0], ...categories];

  return (
    <section className="border-b border-border">
      <div className="grid gap-6 px-5 py-6 sm:px-7">
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
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer transition-colors"
                title="본문 내용을 분석하여 1~2문장의 메타 설명을 자동 생성합니다"
              >
                {isGeneratingDescription ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Sparkles className="size-3" />
                )}
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
          />
        </Field>

        <div className="flex flex-wrap items-end justify-between gap-6">
          {/* 카테고리 (현재 정적 목록 — 백엔드 오픈 전까지 UI 용) */}
          <Field className="max-w-xs">
            <FieldLabel htmlFor="post-editor-category" className={LABEL_CLASS}>
              카테고리
            </FieldLabel>
            <select
              id="post-editor-category"
              value={categoryId ?? ''}
              onChange={(event) => {
                const { value } = event.target;
                const nextCategoryId = Number(value);
                onCategoryChange(value === '' || !Number.isFinite(nextCategoryId) ? null : nextCategoryId);
              }}
              className="h-10 w-full rounded-lg border border-border bg-muted px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {categoryOptions.map((category) => (
                <option key={category.id ?? 'none'} value={category.id ?? ''}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          {/* 공개 여부 */}
          <Field orientation="horizontal" className="w-auto items-center gap-3">
            <FieldLabel htmlFor="post-editor-public" className={LABEL_CLASS}>
              {isPublic ? '공개' : '비공개'}
            </FieldLabel>
            <Switch id="post-editor-public" checked={isPublic} onCheckedChange={onIsPublicChange} />
          </Field>
        </div>
      </div>
    </section>
  );
}
