"use client"

import React, { useState } from "react";
import PolicyLayout from "@/components/domain/policy/layout/PolicyLayout";
import PolicyItem from "@/components/domain/policy/ui/PolicyItem";
import PolicySidebarItem from "@/components/domain/policy/ui/PolicySidebarItem";
import { policyData } from "@/data/policy/policy-data";

export default function PolicyPage() {
  const [activeId, setActiveId] = useState(1);

  return (
    <PolicyLayout
      sidebar={
        <>
          {policyData.map((data) => (
            <PolicySidebarItem
              key={data.id}
              item={data}
              isActive={activeId === data.id}
              onClick={() => {
                setActiveId(data.id);
                document.getElementById(`policy-section-${data.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
          ))}
        </>
      }
    >
      <div className="flex flex-col">
        {policyData.map((data) => (
          <PolicyItem key={data.id} item={data} />
        ))}
      </div>
    </PolicyLayout>
  );
}
