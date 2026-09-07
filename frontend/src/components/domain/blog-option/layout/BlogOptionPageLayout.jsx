"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Header from "@/components/common/layout/Header";
import { buttonVariants } from "@/components/common/ui/button";
import { cn } from "@/lib/utils";

export default function BlogOptionPageLayout({
  blogUserId,
  bioSection,
  categorySection,
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,var(--muted),var(--background)_42%)] text-foreground">
      <Header blogUserId={blogUserId} />

      <div className="mx-auto flex w-full max-w-content-narrow flex-col gap-6 px-5 pb-12 pt-7 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-border/60 bg-card/70 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
              Blog Option
            </p>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              블로그 옵션
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              유저 소개글과 카테고리를 관리하는 전용 페이지입니다. 저장한 내용은
              블로그 홈 구성에 연결되는 데이터를 기준으로 반영됩니다.
            </p>
          </div>

          <Link
            href={blogUserId ? `/@${blogUserId}` : "/"}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-full px-4"
            )}
          >
            <ArrowLeft className="size-4" />
            내 블로그
          </Link>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          {bioSection}
          {categorySection}
        </div>
      </div>
    </main>
  );
}
