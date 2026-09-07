import React, { useState } from "react";
import { NavItem } from "@/components/common/ui/nav-item";

const meta = {
  title: "Common/UI/NavItem",
  component: NavItem,
  tags: ["autodocs"],
  argTypes: {
    isActive: { control: "boolean" },
    children: { control: "text" },
  },
};

export default meta;

export const Default = {
  args: {
    children: "Navigation Item",
    isActive: false,
  },
};

export const Active = {
  args: {
    children: "Active Nav Item",
    isActive: true,
  },
};

export const SidebarExample = {
  render: () => {
    const [activeId, setActiveId] = useState(1);
    const items = [
      { id: 1, title: "대시보드" },
      { id: 2, title: "프로필 설정" },
      { id: 3, title: "알림 센터" },
    ];
    
    return (
      <div className="w-[200px] rounded-xl border border-border bg-card p-4">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          메뉴
        </h3>
        <ul className="space-y-1">
          {items.map((item) => (
            <NavItem
              key={item.id}
              isActive={activeId === item.id}
              onClick={() => setActiveId(item.id)}
            >
              {item.title}
            </NavItem>
          ))}
        </ul>
      </div>
    );
  },
};
