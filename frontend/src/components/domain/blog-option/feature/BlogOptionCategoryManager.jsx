"use client";

import { LoaderCircle, Plus } from "lucide-react";

import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/common/ui/field";
import { Input } from "@/components/common/ui/input";
import BlogOptionCategoryItem from "@/components/domain/blog-option/ui/BlogOptionCategoryItem";

export default function BlogOptionCategoryManager({
  categoryName = "",
  categories = [],
  editingCategoryId = "",
  editingCategoryName = "",
  isLoading = false,
  isAdding = false,
  pendingUpdateId = "",
  pendingDeleteId = "",
  errorMessage = "",
  noticeMessage = "",
  onCategoryNameChange,
  onAddCategory,
  onStartEditCategory,
  onEditingCategoryNameChange,
  onCancelEditCategory,
  onUpdateCategory,
  onDeleteCategory,
}) {
  return (
    <Card className="rounded-[2rem] border-border/60 bg-card/80 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle>카테고리 추가</CardTitle>
        <CardDescription>
          내 블로그에 사용할 카테고리를 추가하고 정리합니다.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Field>
          <FieldLabel>새 카테고리</FieldLabel>
          <form onSubmit={onAddCategory} className="flex flex-col gap-3 sm:flex-row">
            <Input
              variant="outline"
              size="lg"
              value={categoryName}
              onChange={(event) => onCategoryNameChange(event.target.value)}
              placeholder="카테고리 이름"
              className="h-11 rounded-xl"
              disabled={isLoading || isAdding}
            />
            <Button
              type="submit"
              variant="secondary"
              className="h-11 rounded-xl px-5"
              disabled={isLoading || isAdding}
            >
              {isAdding ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  추가 중
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  추가
                </>
              )}
            </Button>
          </form>
          <FieldError>{errorMessage}</FieldError>
        </Field>

        {noticeMessage ? (
          <p className="text-sm font-medium text-foreground/80">{noticeMessage}</p>
        ) : null}

        <section className="space-y-3 border-t border-border/50 pt-5">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              등록된 카테고리
            </h3>
            <p className="text-sm text-muted-foreground">
              아래 목록에서 카테고리를 수정하거나 삭제할 수 있습니다.
            </p>
          </div>

          <div className="max-h-[23rem] space-y-3 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
                카테고리를 불러오는 중입니다.
              </div>
            ) : categories.length ? (
              categories.map((category) => (
                <BlogOptionCategoryItem
                  key={category.id}
                  category={category}
                  editingName={editingCategoryName}
                  isEditing={editingCategoryId === category.id}
                  isUpdating={pendingUpdateId === category.id}
                  isDeleting={pendingDeleteId === category.id}
                  onStartEdit={onStartEditCategory}
                  onEditingNameChange={onEditingCategoryNameChange}
                  onCancelEdit={onCancelEditCategory}
                  onUpdate={onUpdateCategory}
                  onDelete={onDeleteCategory}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
                아직 등록된 카테고리가 없습니다.
              </div>
            )}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
