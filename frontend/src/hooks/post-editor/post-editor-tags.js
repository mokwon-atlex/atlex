'use client';

import { useState } from 'react';
import { extractBodyTags, mergeTags, parseTagInput } from '@/lib/post-editor/tags';

export default function usePostEditorTags(body, { initialManualTags = [] } = {}) {
  const [tagInput, setTagInput] = useState('');
  const [manualTags, setManualTags] = useState(initialManualTags);

  const bodyTags = extractBodyTags(body);
  const combinedTags = mergeTags(manualTags, bodyTags);

  function registerTags(value) {
    const nextTags = parseTagInput(value);

    if (nextTags.length === 0) {
      return false;
    }

    setManualTags((currentTags) => mergeTags(currentTags, nextTags));
    setTagInput('');

    return true;
  }

  function removeManualTag(tagToRemove) {
    setManualTags((currentTags) => currentTags.filter((tag) => tag !== tagToRemove));
  }

  function handleTagInputChange(value) {
    setTagInput(value);
  }

  function handleTagInputKeyDown(event) {
    if (event.nativeEvent.isComposing) {
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      registerTags(tagInput);
      return;
    }

    if (event.key === 'Backspace' && !tagInput.trim() && manualTags.length > 0) {
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
    // 수정 화면에서 기존 게시글의 태그를 한 번에 채워 넣을 때 사용.
    // (일반 태그 추가는 registerTags를 거치지만, 초기 반영은 파싱 없이 그대로 덮어써야 하므로 별도로 노출)
    setManualTags,
    tagInput,
  };
}
