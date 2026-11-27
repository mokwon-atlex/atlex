'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  consumeAiTokens,
  fetchDescriptionAiSuggestion,
  fetchParagraphAiSuggestion,
  fetchTitleAiSuggestion,
} from '@/lib/api/ai';
import { markdownToTiptapContent } from '@/lib/post-editor/markdown-to-html';

const DEBOUNCE_DELAY_MS = 600;

/** 백엔드 AiSuggestionType과 동일한 기능별 AI 토큰 소모량이다. */
export const AI_TOKEN_COSTS = {
  TITLE: 50,
  PARAGRAPH: 300,
  DESCRIPTION: 150,
};

/**
 * API 에러가 AI 토큰·쿼터 소진(HTTP 429 또는 TOO_MANY_AI_REQUESTS)인지 판별한다.
 * apiClient의 envelope 에러(`error.status`)와 일반 Axios 에러(`error.response.status`)를 모두 처리한다.
 *
 * @param {unknown} error API 호출 예외 객체
 * @returns {boolean} 토큰 소진 예외 여부
 */
export function isAiTokenExhaustedError(error) {
  const status = error?.status ?? error?.response?.status;
  return status === 429 || error?.code === 'TOO_MANY_AI_REQUESTS';
}

/**
 * 잔여 토큰 상태에 맞는 사용자 안내 문구를 반환한다.
 *
 * @param {number | null | undefined} remainingTokens 현재 잔여 토큰 수
 * @param {number} [requiredTokens] 요청 기능의 필요 토큰 수
 * @returns {string} 안내 문구
 */
export function getAiTokenExhaustedMessage(remainingTokens, requiredTokens) {
  if (typeof remainingTokens === 'number' && remainingTokens <= 0) {
    return '사용 가능한 AI 토큰이 없습니다. 토큰이 충전된 뒤 다시 이용해 주세요.';
  }

  if (typeof remainingTokens === 'number' && typeof requiredTokens === 'number' && remainingTokens < requiredTokens) {
    return `남은 AI 토큰이 부족합니다. (필요: ${requiredTokens.toLocaleString()} / 남음: ${remainingTokens.toLocaleString()})`;
  }

  return '사용 가능한 AI 토큰이 모두 소진되었습니다. 잠시 후 다시 이용해 주세요.';
}

/**
 * 게시글 에디터 내 AI 자동완성 및 단락 추천을 총괄하는 커스텀 훅입니다.
 */
export default function usePostEditorAiSuggestion({
  category,
  editor,
  remainingTokens = null,
  tags = [],
  title = '',
} = {}) {
  const queryClient = useQueryClient();
  const [titleSuggestion, setTitleSuggestion] = useState('');
  const [isSuggestingTitle, setIsSuggestingTitle] = useState(false);
  const [isSuggestingParagraph, setIsSuggestingParagraph] = useState(false);
  const [isSuggestingDescription, setIsSuggestingDescription] = useState(false);
  const [aiError, setAiError] = useState('');

  const clearAiError = useCallback(() => {
    setAiError('');
  }, []);

  // AI 제안이 실제로 본문·제목·설명에 적용되었을 때만 토큰을 차감하고 캐시를 갱신한다.
  const consumeAndRefreshTokens = useCallback(
    async (type) => {
      try {
        const nextStatus = await consumeAiTokens(type);
        if (nextStatus) {
          queryClient.setQueryData(['aiTokens'], nextStatus);
        }
      } catch {
        // 토큰 차감 동기화 실패는 작성 흐름을 막지 않는다.
      } finally {
        queryClient.invalidateQueries({ queryKey: ['aiTokens'] });
      }
    },
    [queryClient],
  );

  // Ghost Text(AI 이어쓰기)를 Tab으로 실제 수락했을 때만 PARAGRAPH 토큰 차감
  useEffect(() => {
    if (!editor?.storage?.aiSuggestion) return;
    editor.storage.aiSuggestion.onAccept = () => {
      consumeAndRefreshTokens('PARAGRAPH');
    };
    return () => {
      if (editor?.storage?.aiSuggestion) {
        editor.storage.aiSuggestion.onAccept = null;
      }
    };
  }, [editor, consumeAndRefreshTokens]);

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

      // 잔여 토큰이 부족하면 제목 입력 중 불필요한 API 호출을 막는다.
      if (typeof remainingTokens === 'number' && remainingTokens < AI_TOKEN_COSTS.TITLE) {
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
            if (isAiTokenExhaustedError(error)) {
              const message = getAiTokenExhaustedMessage(0);
              setAiError(message);
              queryClient.invalidateQueries({ queryKey: ['aiTokens'] });
            } else {
              setAiError('AI 제목 추천을 가져오지 못했습니다.');
            }
          }
        } finally {
          setIsSuggestingTitle(false);
        }
      }, DEBOUNCE_DELAY_MS);
    },
    [category, queryClient, remainingTokens, tags],
  );

  // 2. 제목 제안 수락 (Tab 키 처리 — 실제 적용 시에만 TITLE 토큰 차감)
  const acceptTitleSuggestion = useCallback(
    (overrideTitle) => {
      if (!titleSuggestion) return '';
      const baseTitle = overrideTitle !== undefined ? overrideTitle : title;
      const needsSpace = baseTitle && !baseTitle.endsWith(' ') && !titleSuggestion.startsWith(' ');
      const completedTitle = `${baseTitle}${needsSpace ? ' ' : ''}${titleSuggestion}`;
      setTitleSuggestion('');
      consumeAndRefreshTokens('TITLE');
      return completedTitle;
    },
    [consumeAndRefreshTokens, title, titleSuggestion],
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

      if (typeof remainingTokens === 'number' && remainingTokens < AI_TOKEN_COSTS.PARAGRAPH) {
        const message = getAiTokenExhaustedMessage(remainingTokens, AI_TOKEN_COSTS.PARAGRAPH);
        setAiError(message);
        toast.error(message);
        return;
      }

      let currentWritingOverride;
      let insertDirectly = false;
      let mode = 'AUTO';

      if (typeof optionsOrWritingOverride === 'string') {
        currentWritingOverride = optionsOrWritingOverride;
      } else if (optionsOrWritingOverride && typeof optionsOrWritingOverride === 'object') {
        currentWritingOverride = optionsOrWritingOverride.currentWritingOverride;
        insertDirectly = Boolean(optionsOrWritingOverride.insertDirectly);
        mode = optionsOrWritingOverride.mode || 'AUTO';
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
            mode,
            tags,
            title,
          },
          controller.signal,
        );

        if (res?.suggestion) {
          let suggestionText = res.suggestion;
          if (insertDirectly) {
            const convertedNodes = markdownToTiptapContent(suggestionText);
            if (convertedNodes) {
              editor.chain().focus().clearAiSuggestion().insertContent(convertedNodes).run();
            } else {
              if (
                lastChar &&
                !/[\s\n]/.test(lastChar) &&
                !suggestionText.startsWith(' ') &&
                !suggestionText.startsWith('\n')
              ) {
                suggestionText = ` ${suggestionText}`;
              }
              editor.chain().focus().clearAiSuggestion().insertContent(suggestionText).run();
            }
            // 직접 삽입 버튼(코드·다이어그램·표·수식)은 즉시 본문에 적용되므로 차감
            consumeAndRefreshTokens('PARAGRAPH');
          } else {
            if (
              lastChar &&
              !/[\s\n]/.test(lastChar) &&
              !suggestionText.startsWith(' ') &&
              !suggestionText.startsWith('\n')
            ) {
              suggestionText = ` ${suggestionText}`;
            }
            editor.commands.setAiSuggestion(suggestionText);
          }
        } else {
          editor.commands.clearAiSuggestion();
        }
      } catch (error) {
        if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
          editor.commands.clearAiSuggestion();
          if (isAiTokenExhaustedError(error)) {
            const message = getAiTokenExhaustedMessage(0);
            setAiError(message);
            toast.error(message);
            queryClient.invalidateQueries({ queryKey: ['aiTokens'] });
          } else {
            setAiError('AI 문장 제안을 불러오지 못했습니다.');
          }
        }
      } finally {
        setIsSuggestingParagraph(false);
      }
    },
    [category, consumeAndRefreshTokens, editor, queryClient, remainingTokens, tags, title],
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

      if (typeof remainingTokens === 'number' && remainingTokens < AI_TOKEN_COSTS.DESCRIPTION) {
        const message = getAiTokenExhaustedMessage(remainingTokens, AI_TOKEN_COSTS.DESCRIPTION);
        setAiError(message);
        toast.error(message);
        return '';
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
        if (res?.suggestion) {
          consumeAndRefreshTokens('DESCRIPTION');
          return res.suggestion;
        }
        return '';
      } catch (error) {
        if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
          if (isAiTokenExhaustedError(error)) {
            const message = getAiTokenExhaustedMessage(0);
            setAiError(message);
            toast.error(message);
            queryClient.invalidateQueries({ queryKey: ['aiTokens'] });
          } else {
            setAiError('AI 요약 생성에 실패했습니다.');
          }
        }
        return '';
      } finally {
        setIsSuggestingDescription(false);
      }
    },
    [consumeAndRefreshTokens, queryClient, remainingTokens, title],
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
