'use client';

// 게시글 상세 화면의 댓글 섹션 컴포넌트.
// 댓글 목록 조회, 신규 댓글 등록, 작성자 본인 댓글의 인라인 수정 및 삭제(다이얼로그 확인) 기능을 제공한다.

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/common/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/common/ui/dialog';
import { Textarea } from '@/components/common/ui/textarea';
import { useComments } from '@/hooks/queries/comments/useComments';
import { useAuthStore } from '@/store/authStore';

const MAX_COMMENT_LENGTH = 1000;

/**
 * ISO 날짜 문자열을 한국어 날짜와 시간 형식으로 변환합니다.
 * @param {string} iso - ISO 날짜 문자열
 * @returns {string} 포맷팅된 날짜 문자열
 */
function formatCommentDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
}

/**
 * 게시글 상세 화면 댓글 UI 컴포넌트.
 * @param {object} props
 * @param {number|string} props.postId - 현재 게시글 ID
 * @param {string} [props.postAuthorUserId] - 현재 게시글 원작자의 userId (작성자 배지용)
 */
export function BlogDetailComments({ postId, postAuthorUserId }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const currentUser = useAuthStore((s) => s.user);

  const {
    comments,
    isLoading,
    isError,
    refetch,
    createComment,
    isCreating,
    updateComment,
    isUpdating,
    deleteComment,
    isDeleting,
  } = useComments(postId);

  // 신규 댓글 입력 상태
  const [newCommentContent, setNewCommentContent] = useState('');
  const [createErrorMessage, setCreateErrorMessage] = useState('');

  // 인라인 수정 상태
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [updateErrorMessage, setUpdateErrorMessage] = useState('');

  // 삭제 확인 모달 상태
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

  // 신규 댓글 등록 처리
  const handleCreateSubmit = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    const trimmed = newCommentContent.trim();
    if (!trimmed || isCreating) return;

    setCreateErrorMessage('');
    try {
      await createComment({ content: trimmed });
      setNewCommentContent('');
    } catch (err) {
      setCreateErrorMessage(err?.message || '댓글 등록에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  // 단축키 (Ctrl+Enter 또는 Cmd+Enter)로 신규 댓글 등록
  const handleCreateKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleCreateSubmit(e);
    }
  };

  // 수정 모드 시작
  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setUpdateErrorMessage('');
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
    setUpdateErrorMessage('');
  };

  // 댓글 수정 저장
  const handleUpdateSubmit = async (commentId) => {
    const trimmed = editContent.trim();
    if (!trimmed || isUpdating) return;

    setUpdateErrorMessage('');
    try {
      await updateComment({ commentId, content: trimmed });
      setEditingCommentId(null);
      setEditContent('');
    } catch (err) {
      setUpdateErrorMessage(err?.message || '댓글 수정에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  // 단축키로 댓글 수정 저장
  const handleEditKeyDown = (e, commentId) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleUpdateSubmit(commentId);
    }
  };

  // 댓글 삭제 확정
  const handleDeleteConfirm = async () => {
    if (!deletingCommentId || isDeleting) return;

    setDeleteErrorMessage('');
    try {
      await deleteComment(deletingCommentId);
      setDeletingCommentId(null);
    } catch (err) {
      setDeleteErrorMessage(err?.message || '댓글 삭제에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <section id="comments" aria-labelledby="comments-heading" className="mt-14 border-t border-border/80 pt-10">
      {/* 헤더: 댓글 수 */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="size-5 text-muted-foreground" aria-hidden="true" />
        <h3 id="comments-heading" className="text-lg font-semibold text-foreground">
          댓글 <span className="text-primary">{comments.length}</span>
        </h3>
      </div>

      {/* 댓글 작성 폼 / 미로그인 안내 */}
      <div className="mb-8">
        {isLoggedIn ? (
          <form onSubmit={handleCreateSubmit} className="space-y-3">
            <div className="relative">
              <label htmlFor="comment-input" className="sr-only">
                댓글 작성
              </label>
              <Textarea
                id="comment-input"
                placeholder="따뜻한 댓글을 남겨보세요 (최대 1,000자)"
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
                onKeyDown={handleCreateKeyDown}
                maxLength={MAX_COMMENT_LENGTH}
                disabled={isCreating}
                rows={3}
                className="w-full resize-none bg-background placeholder:text-muted-foreground/70"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {newCommentContent.length} / {MAX_COMMENT_LENGTH}자
                </span>
                <span className="hidden text-[0.6875rem] text-muted-foreground/60 sm:inline">(Ctrl+Enter로 등록)</span>
              </div>
              <Button
                type="submit"
                size="sm"
                disabled={!newCommentContent.trim() || isCreating}
                className="font-medium"
              >
                {isCreating ? '등록 중...' : '댓글 등록'}
              </Button>
            </div>
            {createErrorMessage && (
              <p role="alert" className="text-xs text-destructive">
                {createErrorMessage}
              </p>
            )}
          </form>
        ) : (
          <div className="rounded-lg border border-border/70 bg-muted/40 p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">댓글을 작성하려면 로그인이 필요합니다.</p>
            <Link href="/auth/login" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              로그인하기
            </Link>
          </div>
        )}
      </div>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">댓글을 불러오는 중입니다...</div>
        ) : isError ? (
          <div className="py-8 text-center">
            <p className="text-sm text-destructive mb-3">댓글을 불러오지 못했습니다.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              다시 시도
            </Button>
          </div>
        ) : comments.length === 0 ? (
          <div className="py-10 text-center rounded-lg border border-dashed border-border/70 text-sm text-muted-foreground">
            아직 작성된 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
          </div>
        ) : (
          comments.map((comment) => {
            const isAuthor = Boolean(
              currentUser?.userId && comment.authorUserId && currentUser.userId === comment.authorUserId,
            );
            const isPostAuthor = Boolean(
              postAuthorUserId && comment.authorUserId && postAuthorUserId === comment.authorUserId,
            );
            const isEditing = editingCommentId === comment.id;
            const hasBeenEdited = comment.updatedAt && comment.updatedAt !== comment.createdAt;
            const authorInitial = (comment.authorName || comment.authorUserId || '?')[0].toUpperCase();

            return (
              <article
                key={comment.id}
                className="rounded-lg border border-border/60 bg-card p-4 transition-colors hover:border-border"
              >
                {/* 작성자 정보 헤더 */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {comment.authorUserId ? (
                      <Link
                        href={`/@${comment.authorUserId}`}
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary transition-opacity hover:opacity-80"
                        aria-label={`${comment.authorName || comment.authorUserId}의 블로그로 이동`}
                      >
                        {authorInitial}
                      </Link>
                    ) : (
                      <div
                        aria-hidden="true"
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
                      >
                        {authorInitial}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {comment.authorUserId ? (
                          <Link
                            href={`/@${comment.authorUserId}`}
                            className="text-sm font-medium text-foreground hover:underline"
                          >
                            {comment.authorName || comment.authorUserId}
                          </Link>
                        ) : (
                          <span className="text-sm font-medium text-foreground">
                            {comment.authorName || comment.authorUserId}
                          </span>
                        )}
                        {isPostAuthor && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[0.6875rem] font-semibold text-primary">
                            작성자
                          </span>
                        )}
                        {comment.authorUserId && (
                          <span className="text-xs text-muted-foreground">@{comment.authorUserId}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[0.75rem] text-muted-foreground">
                        <time dateTime={comment.createdAt}>{formatCommentDate(comment.createdAt)}</time>
                        {hasBeenEdited && <span>(수정됨)</span>}
                      </div>
                    </div>
                  </div>

                  {/* 작성자 본인 제어 버튼 (수정 모드가 아닐 때 노출) */}
                  {isAuthor && !isEditing && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleStartEdit(comment)}
                        aria-label="댓글 수정"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                        <span className="ml-1">수정</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setDeletingCommentId(comment.id)}
                        aria-label="댓글 삭제"
                        className="text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                        <span className="ml-1">삭제</span>
                      </Button>
                    </div>
                  )}
                </div>

                {/* 댓글 내용 또는 수정 폼 */}
                <div className="mt-3">
                  {isEditing ? (
                    <div className="space-y-2">
                      <label htmlFor={`edit-comment-${comment.id}`} className="sr-only">
                        댓글 내용 수정
                      </label>
                      <Textarea
                        id={`edit-comment-${comment.id}`}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
                        onKeyDown={(e) => handleEditKeyDown(e, comment.id)}
                        maxLength={MAX_COMMENT_LENGTH}
                        disabled={isUpdating}
                        rows={3}
                        className="w-full resize-none bg-background text-sm"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {editContent.length} / {MAX_COMMENT_LENGTH}자
                          </span>
                          <span className="hidden text-[0.6875rem] text-muted-foreground/60 sm:inline">
                            (Ctrl+Enter로 수정 완료)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isUpdating}>
                            취소
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateSubmit(comment.id)}
                            disabled={!editContent.trim() || isUpdating}
                          >
                            {isUpdating ? '수정 중...' : '수정 완료'}
                          </Button>
                        </div>
                      </div>
                      {updateErrorMessage && (
                        <p role="alert" className="text-xs text-destructive">
                          {updateErrorMessage}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
                      {comment.content}
                    </p>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* 댓글 삭제 확인 다이얼로그 */}
      <Dialog open={Boolean(deletingCommentId)} onOpenChange={(open) => !open && setDeletingCommentId(null)}>
        <DialogContent size="default" showCloseButton={!isDeleting}>
          <DialogHeader>
            <DialogTitle>댓글 삭제</DialogTitle>
            <DialogDescription>댓글을 삭제하시겠습니까? 삭제된 댓글은 되돌릴 수 없습니다.</DialogDescription>
          </DialogHeader>
          {deleteErrorMessage && (
            <p role="alert" className="text-xs text-destructive px-1">
              {deleteErrorMessage}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCommentId(null)} disabled={isDeleting}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
