"use client"

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";

/**
 * 정책 개별 항목 카드 컴포넌트
 * @param {Object} item - 정책 데이터 (title, summary, content)
 */
export default function PolicyItem({ item }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card id={`policy-section-${item.id}`} className="mb-6 overflow-hidden transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle>{item.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {/* 요약 내용은 항상 보임 */}
        <div className="rounded-lg bg-muted/50 p-4">
          <h4 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
            내용 요약
          </h4>
          <p className="text-sm leading-relaxed text-foreground/80">{item.summary}</p>
        </div>

        {/* 세부 내용 토글 영역 */}
        {!isOpen ? (
          <div className="flex justify-start">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs font-semibold"
              onClick={() => setIsOpen(true)}
            >
              세부내용
            </Button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                세부 내용
              </h4>
              <div className="max-h-60 overflow-y-auto text-sm leading-relaxed text-muted-foreground">
                {item.content}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                접기
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
