"use client";

import { useState } from "react";
import {
  extractBodyTags,
  mergeTags,
  parseTagInput,
} from "@/lib/post-editor/tags";

export default function usePostEditorTags(
  body,
  {
    initialManualTags = [],
  } = {},
) {
  const [tagInput, setTagInput] = useState("");
  const [manualTags, setManualTags] = useState(initialManualTags);

  const bodyTags = extractBodyTags(body);
  const combinedTags = mergeTags(manualTags, bodyTags);

  function registerTags(value) {
    const nextTags = parseTagInput(value);

    if (nextTags.length === 0) {
      return false;
    }

    setManualTags((currentTags) => mergeTags(currentTags, nextTags));
    setTagInput("");

    return true;
  }

  function removeManualTag(tagToRemove) {
    setManualTags((currentTags) =>
      currentTags.filter((tag) => tag !== tagToRemove),
    );
  }

  function handleTagInputChange(value) {
    setTagInput(value);
  }

  function handleTagInputKeyDown(event) {
    if (event.nativeEvent.isComposing) {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      registerTags(tagInput);
      return;
    }

    if (event.key === "Backspace" && !tagInput.trim() && manualTags.length > 0) {
      event.preventDefault();
      setManualTags((currentTags) => currentTags.slice(0, -1));
    }
  }

  return {
    bodyTags,
    combinedTags,
    manualTags,
    onRemoveTag: removeManualTag,
    onTagInputChange: handleTagInputChange,
    onTagInputKeyDown: handleTagInputKeyDown,
    tagInput,
  };
}
