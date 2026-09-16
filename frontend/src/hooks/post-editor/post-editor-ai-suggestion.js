'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchParagraphAiSuggestion, fetchTitleAiSuggestion } from '@/lib/api/ai';

const DEBOUNCE_DELAY_MS = 400;

/**
 * 게시글 에디터 내 AI 자동완성 및 단락 추천을 총괄하는 커스텀 훅입니다.
 */
export default function usePostEditorAiSuggestion({ category, editor, tags = [], title = '' } = {}) {
  const [titleSuggestion, setTitleSuggestion] = useState('');
  const [isSuggestingTitle, setIsSuggestingTitle] = useState(false);
  const [isSuggestingParagraph, setIsSuggestingParagraph] = useState(false);

  const titleAbortControllerRef = useRef(null);
  const paragraphAbortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // 1. 제목 자동완성 요청 (Debounce + AbortController)
  const requestTitleSuggestion = useCallback(
    (currentTitle) => {
      if (titleAbortControllerRef.current) {
        titleAbortControllerRef.current.abort();
      }

      if (!currentTitle || currentTitle.trim().length < 2) {
        setTitleSuggestion('');
        return;
      }

      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(async () => {
        const controller = new AbortController();
        titleAbortControllerRef.current = controller;
        setIsSuggestingTitle(true);

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
          }
        } finally {
          setIsSuggestingTitle(false);
        }
      }, DEBOUNCE_DELAY_MS);
    },
    [category, tags],
  );

  // 2. 제목 제안 수락 (Tab 키 처리)
  const acceptTitleSuggestion = useCallback(() => {
    if (!titleSuggestion) return '';
    const completedTitle = `${title}${titleSuggestion}`;
    setTitleSuggestion('');
    return completedTitle;
  }, [title, titleSuggestion]);

  // 3. 제목 제안 취소
  const dismissTitleSuggestion = useCallback(() => {
    setTitleSuggestion('');
  }, []);

  // 4. 본문 단락 추천 요청
  const requestParagraphSuggestion = useCallback(
    async (currentWriting) => {
      if (paragraphAbortControllerRef.current) {
        paragraphAbortControllerRef.current.abort();
      }

      if (!editor) return;

      const controller = new AbortController();
      paragraphAbortControllerRef.current = controller;
      setIsSuggestingParagraph(true);

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
          editor.commands.setAiSuggestion(res.suggestion);
        }
      } catch (error) {
        if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
          editor.commands.clearAiSuggestion();
        }
      } finally {
        setIsSuggestingParagraph(false);
      }
    },
    [category, editor, tags, title],
  );

  // 언마운트 시 미완료 타이머 및 요청 정리
  useEffect(() => {
    return () => {
      clearTimeout(debounceTimerRef.current);
      if (titleAbortControllerRef.current) titleAbortControllerRef.current.abort();
      if (paragraphAbortControllerRef.current) paragraphAbortControllerRef.current.abort();
    };
  }, []);

  return {
    acceptTitleSuggestion,
    dismissTitleSuggestion,
    isSuggestingParagraph,
    isSuggestingTitle,
    requestParagraphSuggestion,
    requestTitleSuggestion,
    setTitleSuggestion,
    titleSuggestion,
  };
}
