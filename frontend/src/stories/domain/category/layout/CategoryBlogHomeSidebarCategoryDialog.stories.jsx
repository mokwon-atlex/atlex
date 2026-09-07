"use client";

import { useState } from "react";
import CategoryBlogHomeSidebarCategoryDialog from "@/components/domain/category/layout/CategoryBlogHomeSidebarCategoryDialog";

/** @type { import('@storybook/nextjs-vite').Meta<typeof CategoryBlogHomeSidebarCategoryDialog> } */
const meta = {
  title: "Domain/Category/Layout/CategoryBlogHomeSidebarCategoryDialog",
  component: CategoryBlogHomeSidebarCategoryDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    actionId: { control: "text", description: "액션 ID" },
    ariaLabel: { control: "text", description: "aria-label 텍스트" },
    label: { control: "text", description: "버튼 레이블" },
    onCategorySelect: { action: "categorySelected" },
  },
};
export default meta;

const mockCategories = [
  { id: "all", label: "전체 글", description: "블로그 홈의 전체 게시물을 한 번에 확인합니다." },
  { id: "ui-lab", label: "UI 실험", description: "레이아웃과 컴포넌트 인터랙션을 다듬는 기록입니다.", postIds: [1] },
  { id: "work-log", label: "작업 로그", description: "작업 과정과 회고를 짧은 메모처럼 남깁니다.", postIds: [2] },
  { id: "private-notes", label: "비공개 메모", description: "아직 공개하지 않은 초안과 개인 메모를 모아둡니다.", postIds: [3] },
  { id: "archive", label: "아카이브 정리", description: "발행한 글과 정리 메모를 다시 묶어보는 카테고리입니다.", postIds: [1, 2] },
  { id: "design-notes", label: "디자인 메모", description: "작은 시각적 조정과 레이아웃 메모를 정리합니다.", postIds: [1, 3] },
];

const mockPosts = [
  { id: 1, date: "2024-05-10" },
  { id: 2, date: "2024-05-08" },
  { id: 3, date: "2024-05-06" },
];

function ControlledDialog({ initialCategoryId = "all" }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        선택된 카테고리: <strong>{selectedCategoryId}</strong>
      </p>
      <CategoryBlogHomeSidebarCategoryDialog
        actionId="category"
        ariaLabel="카테고리 선택"
        label="카테고리"
        categories={mockCategories}
        posts={mockPosts}
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={setSelectedCategoryId}
      />
    </div>
  );
}

export const Default = {
  render: () => <ControlledDialog initialCategoryId="all" />,
};

export const WithPreselected = {
  render: () => <ControlledDialog initialCategoryId="ui-lab" />,
};
