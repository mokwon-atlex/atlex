"use client";

import { useState } from "react";

function getFirstTool(toolCategories) {
  return toolCategories[0] ?? null;
}

function getActiveTool(toolCategories, toolId) {
  const firstTool = getFirstTool(toolCategories);

  return toolCategories.find((tool) => tool.id === toolId) ?? firstTool;
}

function getActiveGroup(tool, groupId) {
  return tool?.groups.find((group) => group.id === groupId) ?? tool?.groups[0] ?? null;
}

export default function usePostEditorPanels(
  toolCategories,
  {
    initialGroupId,
    initialOpen = false,
    initialToolId,
  } = {},
) {
  const initialTool = getActiveTool(toolCategories, initialToolId);
  const initialGroup = getActiveGroup(initialTool, initialGroupId);

  const [isToolPanelOpen, setIsToolPanelOpen] = useState(
    initialOpen && Boolean(initialTool && initialGroup),
  );
  const [selectedToolId, setSelectedToolId] = useState(initialTool?.id ?? "");
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroup?.id ?? "");

  const activeTool = getActiveTool(toolCategories, selectedToolId);
  const activeGroup = getActiveGroup(activeTool, selectedGroupId);

  function openToolPanel(toolId) {
    const nextTool = getActiveTool(toolCategories, toolId);

    if (!nextTool) {
      return;
    }

    if (isToolPanelOpen && nextTool.id === activeTool?.id) {
      setIsToolPanelOpen(false);
      return;
    }

    setSelectedToolId(nextTool.id);
    setSelectedGroupId(nextTool.groups[0]?.id ?? "");
    setIsToolPanelOpen(true);
  }

  function selectGroup(groupId) {
    if (!activeTool?.groups.some((group) => group.id === groupId)) {
      return;
    }

    setSelectedGroupId(groupId);
  }

  function closeToolPanel() {
    setIsToolPanelOpen(false);
  }

  return {
    activeGroup,
    activeTool,
    closeToolPanel,
    isToolPanelOpen,
    openToolPanel,
    selectGroup,
    selectedToolId,
  };
}
