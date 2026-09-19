'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchDescriptionAiSuggestion, fetchParagraphAiSuggestion, fetchTitleAiSuggestion } from '@/lib/api/ai';

const DEBOUNCE_DELAY_MS = 600;

/**
 * 게시글 에디터 내 AI 자동완성 및 단락 추천을 총괄하는 커스텀 훅입니다.
 */
export default function usePostEditorAiSuggestion({ category, editor, tags = [], title = '' } = {}) {
  const [titleSuggestion, setTitleSuggestion] = useState('');
  const [isSuggestingTitle, setIsSuggestingTitle] = useState(false);
  const [isSuggestingParagraph, setIsSuggestingParagraph] = useState(false);
  const [isSuggestingDescription, setIsSuggestingDescription] = useState(false);
  const [aiError, setAiError] = useState('');

  const clearAiError = useCallback(() => {
    setAiError('');
  }, []);

  const titleAbortControllerRef = useRef(null);
  const paragraphAbortControllerRef = useRef(null);
  const descriptionAbortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // 1. 제목 자동완성 요청 (Debounce + AbortController)
  const requestTitleSuggestion = useCallback(
    (currentTitle) => {
      if (titleAbortControllerRef.current) {
        titleAbortControllerRef.current.abort();
      }

      setTitleSuggestion('');
      clearTimeout(debounceTimerRef.current);

      if (!currentTitle || currentTitle.trim().length < 2) {
        return;
      }

      debounceTimerRef.current = setTimeout(async () => {
        const controller = new AbortController();
        titleAbortControllerRef.current = controller;
        setIsSuggestingTitle(true);
        setAiError('');

        try {
          const res = await fetchTitleAiSuggestion(
            {
              category,
              currentTitle: currentTitle.trim(),
              tags,
            },
            controller.signal,
          );
          setTitleSuggestion(res?.suggestion || '');
        } catch (error) {
          if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
            setTitleSuggestion('');
            setAiError('AI 제목 추천을 가져오지 못했습니다.');
          }
        } finally {
          setIsSuggestingTitle(false);
        }
      }, DEBOUNCE_DELAY_MS);
    },
    [category, tags],
  );

  // 2. 제목 제안 수락 (Tab 키 처리)
  const acceptTitleSuggestion = useCallback(
    (overrideTitle) => {
      if (!titleSuggestion) return '';
      const baseTitle = overrideTitle !== undefined ? overrideTitle : title;
      const needsSpace = baseTitle && !baseTitle.endsWith(' ') && !titleSuggestion.startsWith(' ');
      const completedTitle = `${baseTitle}${needsSpace ? ' ' : ''}${titleSuggestion}`;
      setTitleSuggestion('');
      return completedTitle;
    },
    [title, titleSuggestion],
  );

  // 3. 제목 제안 취소
  const dismissTitleSuggestion = useCallback(() => {
    setTitleSuggestion('');
  }, []);

  // 4. 본문 단락 추천 요청
  const requestParagraphSuggestion = useCallback(
    async (optionsOrWritingOverride = {}) => {
      if (paragraphAbortControllerRef.current) {
        paragraphAbortControllerRef.current.abort();
      }

      if (!editor) return;

      let currentWritingOverride;
      let insertDirectly = false;

      if (typeof optionsOrWritingOverride === 'string') {
        currentWritingOverride = optionsOrWritingOverride;
      } else if (optionsOrWritingOverride && typeof optionsOrWritingOverride === 'object') {
        currentWritingOverride = optionsOrWritingOverride.currentWritingOverride;
        insertDirectly = Boolean(optionsOrWritingOverride.insertDirectly);
      }

      let currentWriting = currentWritingOverride;
      let lastChar = '';
      if (currentWriting === undefined && editor.state) {
        const { from } = editor.state.selection;
        const textBefore = editor.state.doc.textBetween(0, from, '\n', '\n');
        currentWriting = textBefore.length > 1000 ? textBefore.slice(-1000) : textBefore;
        if (from > 0) {
          lastChar = editor.state.doc.textBetween(from - 1, from, '\n', '\n');
        }
      }

      const controller = new AbortController();
      paragraphAbortControllerRef.current = controller;
      setIsSuggestingParagraph(true);
      setAiError('');
      editor.commands.setAiLoading?.(true);

      try {
        const res = await fetchParagraphAiSuggestion(
          {
            category,
            currentWriting,
            tags,
            title,
          },
          controller.signal,
        );

        if (res?.suggestion) {
          let suggestionText = res.suggestion;
          if (
            lastChar &&
            !/[\s\n]/.test(lastChar) &&
            !suggestionText.startsWith(' ') &&
            !suggestionText.startsWith('\n')
          ) {
            suggestionText = ` ${suggestionText}`;
          }

          if (insertDirectly) {
            editor.chain().focus().clearAiSuggestion().insertContent(suggestionText).run();
          } else {
            editor.commands.setAiSuggestion(suggestionText);
          }
        } else {
          editor.commands.clearAiSuggestion();
        }
      } catch (error) {
        if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
          editor.commands.clearAiSuggestion();
          setAiError('AI 문장 제안을 불러오지 못했습니다.');
        }
      } finally {
        setIsSuggestingParagraph(false);
      }
    },
    [category, editor, tags, title],
  );

  // 4-1. 본문 단락 추천 진행 중단 (Escape 등)
  const abortParagraphSuggestion = useCallback(() => {
    if (paragraphAbortControllerRef.current) {
      paragraphAbortControllerRef.current.abort();
    }
    setIsSuggestingParagraph(false);
  }, []);

  // 5. 본문 요약(Description) 제안 요청
  const requestDescriptionSuggestion = useCallback(
    async ({ title: overrideTitle, content } = {}) => {
      if (descriptionAbortControllerRef.current) {
        descriptionAbortControllerRef.current.abort();
      }

      if (!content || !content.trim()) {
        setAiError('요약할 본문 내용이 없습니다.');
        return '';
      }

      const controller = new AbortController();
      descriptionAbortControllerRef.current = controller;
      setIsSuggestingDescription(true);
      setAiError('');

      try {
        const res = await fetchDescriptionAiSuggestion(
          {
            content: content.trim(),
            title: overrideTitle !== undefined ? overrideTitle : title,
          },
          controller.signal,
        );
        return res?.suggestion || '';
      } catch (error) {
        if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
          setAiError('AI 요약 생성에 실패했습니다.');
        }
        return '';
      } finally {
        setIsSuggestingDescription(false);
      }
    },
    [title],
  );

  // 언마운트 시 미완료 타이머 및 요청 정리
  useEffect(() => {
    return () => {
      clearTimeout(debounceTimerRef.current);
      if (titleAbortControllerRef.current) titleAbortControllerRef.current.abort();
      if (paragraphAbortControllerRef.current) paragraphAbortControllerRef.current.abort();
      if (descriptionAbortControllerRef.current) descriptionAbortControllerRef.current.abort();
    };
  }, []);

  return {
    abortParagraphSuggestion,
    acceptTitleSuggestion,
    aiError,
    clearAiError,
    dismissTitleSuggestion,
    isSuggestingDescription,
    isSuggestingParagraph,
    isSuggestingTitle,
    requestDescriptionSuggestion,
    requestParagraphSuggestion,
    requestTitleSuggestion,
    setTitleSuggestion,
    titleSuggestion,
  };
}
