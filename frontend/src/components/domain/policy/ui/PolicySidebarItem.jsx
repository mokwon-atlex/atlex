import React from "react";
import { NavItem } from "@/components/common/ui/nav-item";

/**
 * 정책 사이드바 목차 아이템 컴포넌트
 * @param {Object} item - 정책 데이터 (title)
 * @param {boolean} isActive - 현재 활성화된(보고 있는) 항목인지 여부
 * @param {function} onClick - 클릭 핸들러
 */
export default function PolicySidebarItem({ item, isActive, onClick }) {
  return (
    <NavItem 
      isActive={isActive} 
      onClick={onClick}
    >
      {item.title}
    </NavItem>
  );
}
