"use client";

import { useState } from "react";
import PolicySidebarItem from "@/components/domain/policy/ui/PolicySidebarItem";

/** @type { import('@storybook/nextjs-vite').Meta<typeof PolicySidebarItem> } */
const meta = {
  title: "Domain/Policy/UI/PolicySidebarItem",
  component: PolicySidebarItem,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    isActive: { control: "boolean", description: "현재 활성화된 항목 여부" },
    onClick: { action: "clicked" },
    item: { control: "object" },
  },
  decorators: [
    (Story) => (
      <div className="w-[240px] rounded-xl border border-border bg-card p-4">
        <Story />
      </div>
    ),
  ],
};
export default meta;

const mockItem = { title: "제1조 (목적)" };

export const Default = {
  args: {
    item: mockItem,
    isActive: false,
  },
};

export const Active = {
  args: {
    item: mockItem,
    isActive: true,
  },
};

export const LongTitle = {
  args: {
    item: { title: "제10조 (개인정보의 보호 및 사용에 관한 사항)" },
    isActive: false,
  },
};

export const NavigationList = {
  render: () => {
    const items = [
      { title: "제1조 (목적)" },
      { title: "제2조 (용어의 정의)" },
      { title: "제3조 (약관의 명시와 개정)" },
      { title: "제4조 (서비스의 제공)" },
      { title: "제5조 (개인정보의 보호)" },
    ];
    const [activeIndex, setActiveIndex] = useState(0);

    return (
      <div className="w-[240px] rounded-xl border border-border bg-card p-4">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          목차
        </h3>
        <ul className="space-y-1">
          {items.map((item, index) => (
            <li key={index}>
              <PolicySidebarItem
                item={item}
                isActive={activeIndex === index}
                onClick={() => setActiveIndex(index)}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  },
};
