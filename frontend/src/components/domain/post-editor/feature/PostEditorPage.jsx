'use client';

// write/수정 공용 orchestration 레이어.
// postId가 없으면 작성 모드, 있으면 수정 모드로 동작한다.
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
import { useUpdatePost } from '@/hooks/queries/posts/useUpdatePost';
import { usePost } from '@/hooks/queries/posts/usePost';
import { loadUserBlogCategories } from '@/lib/category/blog-categories';
import { useAuthStore } from '@/store/authStore';

/**
 * 게시글 작성/수정 공용 화면.
 *
 * @param {object} props
 * @param {string|number} [props.postId] - 수정할 게시글 ID. 없으면 작성 모드로 동작한다.
 */
export default function PostEditorPage({ postId }) {
  const isEditMode = Boolean(postId);
  const router = useRouter();
  const userId = useAuthStore((state) => state.user?.userId);

  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isPublic, setIsPublic] = useState(true);
  // 게시/수정 직전 클라이언트 검증 메시지(빈 제목/본문 등). API 에러와 구분해 둔다.
  const [validationError, setValidationError] = useState('');
  // 수정 모드에서 기존 데이터를 폼에 이미 반영했는지 여부(중복 반영 방지용)
  const [isInitialized, setIsInitialized] = useState(!isEditMode);

  // tiptap 에디터 인스턴스·본문 텍스트·툴바 실행을 한 번에 관리하는 훅
  const richText = usePostEditorRichText();

  // 수동 태그 입력 + 본문 #해시태그 자동 감지를 통합 관리하는 훅
  const tagField = usePostEditorTags(richText.bodyText);

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  // 수정 모드일 때만 기존 게시글을 조회한다.
  const {
    data: existingPost,
    isLoading: isPostLoading,
    isError: isPostError,
  } = usePost(isEditMode ? postId : undefined);

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

  // 작성자 본인이 아니면 수정 화면 접근을 막고 상세 페이지로 돌려보낸다.
  // (PostResponse.authorUserId 기준 — backend PostResponse.java 확인 완료)
  useEffect(() => {
    if (!isEditMode || !existingPost || !userId) return;
    if (existingPost.authorUserId !== userId) {
      router.replace(`/@${existingPost.authorUserId}/${existingPost.id}`);
    }
  }, [isEditMode, existingPost, userId, router]);

  // 수정 모드: 기존 게시글 데이터를 폼 상태와 에디터에 최초 1회 반영.
  // existingPost가 richText.editor보다 먼저 준비될 수 있으므로, editor가 없으면
  // isInitialized를 설정하지 않고 보류한다(이후 editor가 준비되면 effect가 재실행된다).
  useEffect(() => {
    if (!isEditMode || !existingPost || isInitialized) return;
    if (!richText.editor) return;

    setTitle(existingPost.title ?? '');
    setDescription(existingPost.description ?? '');
    setCategoryId(existingPost.categoryId ?? null);
    setIsPublic(existingPost.isPublic ?? true);

    // tiptap 에디터에 기존 본문 HTML을 채워 넣는다(본문이 비어 있어도 명시적으로 적용).
    richText.editor.commands.setContent(existingPost.content ?? '');

    // 기존 태그를 수동 태그 목록에 반영한다.
    tagField.setManualTags(existingPost.tags ?? []);

    setIsInitialized(true);
  }, [isEditMode, existingPost, isInitialized, richText.editor]);

  // 사용자가 입력을 수정하기 시작하면 이전 검증/요청 에러를 지운다.
  // (createPost.isError/updatePost.isError는 의존성에서 제외 — mutation 실패 자체가 아니라
  //  입력값이 바뀔 때만 실행되어야 한다)
  useEffect(() => {
    setValidationError('');
    if (createPost.isError) createPost.reset();
    if (updatePost.isError) updatePost.reset();
  }, [title, description, richText.bodyText, categoryId, isPublic]);

  const activeMutation = isEditMode ? updatePost : createPost;

  function handlePublish() {
    // 중복 클릭 방지 — 같은 글이 여러 번 생성/수정되는 것을 막는다.
    if (activeMutation.isPending) return;

    setValidationError('');

    // 게시/수정 전 최소 검증: 제목/본문이 비어 있으면 막는다.
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
      categoryId, // null 이면 각 mutation 이 알아서 제외
      isPublic,
      tags: tagField.combinedTags, // 백엔드 미구현이라 현재는 무시될 수 있음
    };

    if (isEditMode) {
      updatePost.mutate(
        { postId, ...payload },
        {
          onSuccess: (data) => {
            const targetAuthorId = data?.authorUserId ?? existingPost?.authorUserId;
            const targetPostId = data?.id ?? postId;
            if (targetAuthorId && targetPostId) {
              router.push(`/@${targetAuthorId}/${targetPostId}`);
            }
          },
        },
      );
      return;
    }

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

  // 수정 모드에서 기존 글을 불러오는 중/실패했을 때는 폼 대신 상태 메시지를 보여준다.
  // TODO: 프로젝트에 공용 로딩/에러 컴포넌트가 있다면 그걸로 교체할 것.
  if (isEditMode && isPostLoading) {
    return <div className="p-7 text-center text-muted-foreground">불러오는 중…</div>;
  }
  if (isEditMode && isPostError) {
    return <div className="p-7 text-center text-destructive">게시글을 불러오지 못했습니다.</div>;
  }

  return (
    <>
      {/* PostEditorShell: 둥근 모서리·테두리·그림자로 에디터 전체를 감싸는 외곽 카드 */}
      <PostEditorShell>
        <PostEditorTopBar
          logoLabel={postEditorCopy.logoLabel}
          onOpenDraftModal={() => setIsDraftModalOpen(true)}
          onPublish={handlePublish}
          publishDisabled={activeMutation.isPending}
          publishButtonLabel={
            activeMutation.isPending ? (isEditMode ? '수정 중…' : '게시 중…') : isEditMode ? '수정 완료' : '게시'
          }
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

        {(validationError || activeMutation.isError) && (
          <div className="px-5 pt-4 sm:px-7">
            <Alert variant="destructive">
              <AlertDescription>
                {validationError ||
                  activeMutation.error?.message ||
                  (isEditMode
                    ? '수정에 실패했습니다. 잠시 후 다시 시도해 주세요.'
                    : '게시에 실패했습니다. 잠시 후 다시 시도해 주세요.')}
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
