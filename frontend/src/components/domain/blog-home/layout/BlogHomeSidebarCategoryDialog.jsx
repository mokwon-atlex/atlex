"use client";

import { useState } from "react";

import { FolderOpen } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/common/ui/dialog";
import { Textfield } from "@/components/common/ui/textfield";
import { cn } from "@/lib/utils";

const defaultTitle = "카테고리";
const defaultDescription =
  "카테고리 모달은 일단 표시만 해두고, 내부 콘텐츠는 추후 추가할 예정입니다.";
const defaultBody = "공통 Dialog 연결은 완료된 상태입니다.";

const dialogIconMap = {
  category: FolderOpen,
};

export default function BlogHomeSidebarCategoryDialog({
  actionId = "category",
  ariaLabel,
  body = defaultBody,
  dialogContentClassName,
  dialogSize = "md",
  label,
  renderBody,
  showHeader = true,
  title = defaultTitle,
  description = defaultDescription,
}) {
  const [open, setOpen] = useState(false);
  const Icon = dialogIconMap[actionId];
  const resolvedBody = renderBody
    ? renderBody({
        closeDialog() {
          setOpen(false);
        },
      })
    : body
      ? (
          <Textfield variant="muted" size="sm">
            {body}
          </Textfield>
        )
      : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        aria-label={ariaLabel ?? label}
        className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card p-0 font-semibold text-foreground shadow-none transition-colors hover:bg-card"
      >
        {Icon ? <Icon className="size-4" /> : null}
        <span className="sr-only">{label}</span>
      </DialogTrigger>

      <DialogContent
        size={dialogSize}
        className={cn(
          "max-h-[70vh] gap-5 overflow-y-auto rounded-3xl p-5 sm:p-6",
          dialogContentClassName
        )}
      >
        {showHeader ? (
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg font-bold tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="leading-6">
              {description}
            </DialogDescription>
          </DialogHeader>
        ) : null}

        {resolvedBody}
      </DialogContent>
    </Dialog>
  );
}
