'use client';

import { useState } from 'react';
import { extractBodyTags, mergeTags, parseTagInput } from '@/lib/post-editor/tags';

/**
 * 게시글 태그 입력 훅. 수동 입력 태그와 본문의 #해시태그를 합쳐 관리한다.
 *
 * @param {string} body - 해시태그를 추출할 본문 텍스트.
 * @param {object} [options]
 * @param {string[]} [options.initialManualTags] - 수동 태그 초기값(기본: []).
 * @returns {object} 태그 목록(`manualTags`, `bodyTags`, `combinedTags`), 입력값(`tagInput`)과
 *   입력·삭제 핸들러, 수정 화면에서 기존 태그를 덮어쓸 때 쓰는 `setManualTags`.
 */
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
