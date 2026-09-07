'use client';

import React, { useState } from 'react';
import Header from '@/components/common/layout/Header';
import { Separator } from '@/components/common/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/common/ui/tabs';

/**
 * 정책 페이지 전용 레이아웃 컴포넌트
 * @param {ReactNode} children - 좌측 본문 컨텐츠 (PolicyItem 리스트)
 * @param {ReactNode} sidebar - 우측 사이드바 컨텐츠 (목차)
 */
export default function PolicyLayout({ children, sidebar }) {
  const [activeTab, setActiveTab] = useState('이용 약관');

  const tabs = ['이용 약관', '개인정보처리방침', '쿠키 정책'];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="mx-auto w-full max-w-content-narrow px-5 pb-12 pt-7 sm:px-8 lg:px-10">
        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tight">이용약관 및 정책</h2>
          <p className="mt-2 text-muted-foreground">
            서비스 이용을 위한 중요 약관 및 정책 안내입니다.
          </p>
        </div>

        {/* 공통 Tabs 컴포넌트 사용 */}
        <nav className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              {tabs.map(tab => (
                <TabsTrigger key={tab} value={tab}>
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </nav>

        <Separator className="mb-8" />

        {/* 2단 그리드 레이아웃 */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
          {/* 본문 구역 */}
          <div className="order-2 lg:order-1">{children}</div>

          {/* 사이드바 구역 */}
          <aside className="order-1 lg:order-2">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-4 shadow-sm">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                목차
              </h3>
              <ul className="space-y-1">{sidebar}</ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
