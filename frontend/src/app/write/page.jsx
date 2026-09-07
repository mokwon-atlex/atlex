'use client';

// write 페이지의 최상위 orchestration 레이어.
// 상태·훅을 여기서 한 곳에서 관리하고, 각 Section 컴포넌트에 props로 내려준다.
// 레이아웃 조합과 모달 열림 여부 외의 로직은 훅에 위임한다.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/common/ui/alert';
import PostEditorContentSection from '@/components/domain/post-editor/layout/PostEditorContentSection';
import PostEditorDraftModal from '@/components/domain/post-editor/layout/PostEditorDraftModal';
import PostEditorMetaSection from '@/components/domain/post-editor/layout/PostEditorMetaSection';
import PostEditorTitleSection from '@/components/domain/post-editor/layout/PostEditorTitleSection';
import PostEditorToolRail from '@/components/domain/post-editor/layout/PostEditorToolRail';
import PostEditorTopBar from '@/components/domain/post-editor/layout/PostEditorTopBar';
import PostEditorCanvasLayout from '@/components/domain/post-editor/layout/PostEditorCanvasLayout';
import PostEditorShell from '@/components/domain/post-editor/layout/PostEditorShell';
import { postEditorCopy } from '@/data/post-editor/post-editor-copy';
import { postEditorDrafts } from '@/data/post-editor/post-editor-drafts';
import { postEditorToolCategories } from '@/data/post-editor/post-editor-tool-categories';
import usePostEditorRichText from '@/hooks/post-editor/post-editor-rich-text';
import usePostEditorTags from '@/hooks/post-editor/post-editor-tags';
import { useCreatePost } from '@/hooks/queries/posts/useCreatePost';
import { loadUserBlogCategories } from '@/lib/category/blog-categories';
import { useAuthStore } from '@/store/authStore';

export default function PostWritePage() {
  const router = useRouter();
  const userId = useAuthStore((state) => state.user?.userId);

  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isPublic, setIsPublic] = useState(true);
  // 게시 직전 클라이언트 검증 메시지(빈 제목/본문 등). API 에러와 구분해 둔다.
  const [validationError, setValidationError] = useState('');

  // tiptap 에디터 인스턴스·본문 텍스트·툴바 실행을 한 번에 관리하는 훅
  const richText = usePostEditorRichText();

  // 수동 태그 입력 + 본문 #해시태그 자동 감지를 통합 관리하는 훅
  const tagField = usePostEditorTags(richText.bodyText);

  const createPost = useCreatePost();

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      if (!userId) {
        setCategories([]);
        return;
      }

      try {
        const nextCategories = await loadUserBlogCategories(userId);
        if (!cancelled) {
          setCategories(nextCategories);
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // 사용자가 입력을 수정하기 시작하면 이전 검증/요청 에러를 지운다(에러가 계속 떠 있어 어색한 것 방지).
  useEffect(() => {
    setValidationError('');
    if (createPost.isError) createPost.reset();
  }, [title, description, richText.bodyText, categoryId, isPublic, createPost.isError]);

  function handlePublish() {
    // 게시 중 중복 클릭 방지 — 같은 글이 여러 번 생성되는 것을 막는다.
    if (createPost.isPending) return;

    setValidationError('');

    // 게시 전 최소 검증: 제목/본문이 비어 있으면 막는다.
    if (!title.trim()) {
      setValidationError('제목을 입력해 주세요.');
      return;
    }
    if (richText.isEditorEmpty) {
      setValidationError('본문을 입력해 주세요.');
      return;
    }

    const payload = {
      title: title.trim(),
      content: richText.getHTML(), // 서식 보존을 위해 HTML 로 저장
      description: description.trim() || undefined,
      categoryId, // null 이면 createPost 가 알아서 제외
      isPublic,
      tags: tagField.combinedTags, // 백엔드 미구현이라 현재는 무시될 수 있음
    };

    createPost.mutate(payload, {
      onSuccess: (data) => {
        // 작성된 글 상세(/@{authorUserId}/{postId})로 이동.
        // 응답에 필요한 필드가 없으면(예상치 못한 응답) 라우팅을 건너뛴다(런타임 에러 방지).
        if (data?.authorUserId && data?.id) {
          router.push(`/@${data.authorUserId}/${data.id}`);
        }
      },
    });
  }

  return (
    <>
      {/* PostEditorShell: 둥근 모서리·테두리·그림자로 에디터 전체를 감싸는 외곽 카드 */}
      <PostEditorShell>
        <PostEditorTopBar
          logoLabel={postEditorCopy.logoLabel}
          onOpenDraftModal={() => setIsDraftModalOpen(true)}
          onPublish={handlePublish}
          publishDisabled={createPost.isPending}
          publishButtonLabel={createPost.isPending ? '게시 중…' : '게시'}
        />

        <PostEditorTitleSection
          title={title}
          titlePlaceholder={postEditorCopy.titlePlaceholder}
          tagField={tagField}
          tagPlaceholder={postEditorCopy.tagPlaceholder}
          onTitleChange={setTitle}
        />

        <PostEditorMetaSection
          description={description}
          onDescriptionChange={setDescription}
          categoryId={categoryId}
          categories={categories}
          onCategoryChange={setCategoryId}
          isPublic={isPublic}
          onIsPublicChange={setIsPublic}
        />

        {(validationError || createPost.isError) && (
          <div className="px-5 pt-4 sm:px-7">
            <Alert variant="destructive">
              <AlertDescription>
                {validationError ||
                  createPost.error?.message ||
                  '게시에 실패했습니다. 잠시 후 다시 시도해 주세요.'}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <PostEditorCanvasLayout
          content={
            <PostEditorContentSection
              bodyPlaceholder={postEditorCopy.bodyPlaceholder}
              bodyText={richText.bodyText}
              editor={richText.editor}
              isEditorEmpty={richText.isEditorEmpty}
            />
          }
          toolRail={
            <PostEditorToolRail
              toolCategories={postEditorToolCategories}
              getItemState={richText.getToolbarItemState}
              onExecuteItem={richText.executeToolbarItem}
            />
          }
        />
      </PostEditorShell>
      {/* DraftModal은 Dialog portal로 body에 마운트되므로 Shell 바깥에 위치해야 한다 */}
      <PostEditorDraftModal
        drafts={postEditorDrafts}
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
      />
    </>
  );
}
