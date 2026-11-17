'use client';

// [Section] 팔로워 / 팔로잉 목록 모달 — 탭 전환으로 대상 사용자의 팔로워·팔로잉 목록을 조회한다.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Users } from 'lucide-react';

import { Button } from '@/components/common/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/common/ui/dialog';
import { fetchFollowers, fetchFollowing } from '@/lib/api/follows';

/**
 * 팔로워/팔로잉 사용자 목록 모달.
 *
 * @param {object} props
 * @param {'followers' | 'following' | null} props.activeTab 열린 탭 (null이면 닫힘)
 * @param {string} props.userId 대상 사용자 아이디
 * @param {() => void} props.onClose 모달 닫기 핸들러
 * @param {(tab: 'followers' | 'following') => void} props.onTabChange 탭 전환 핸들러
 */
export default function BlogHomeFollowListModal({ activeTab, userId, onClose, onTabChange }) {
  const isOpen = activeTab === 'followers' || activeTab === 'following';
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !userId) {
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError('');

    const loader = activeTab === 'followers' ? fetchFollowers : fetchFollowing;
    loader(userId)
      .then((list) => {
        if (!cancelled) {
          setUsers(Array.isArray(list) ? list : []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message ?? '목록을 불러오지 못했습니다.');
          setUsers([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, activeTab, userId]);

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && onClose?.()}>
      <DialogContent size="md" className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Users className="size-4" />
            {activeTab === 'followers' ? '팔로워' : '팔로잉'}
          </DialogTitle>
          <DialogDescription>@{userId}님의 네트워크</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 border-b border-border pb-3">
          <Button
            type="button"
            variant={activeTab === 'followers' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTabChange?.('followers')}
          >
            팔로워
          </Button>
          <Button
            type="button"
            variant={activeTab === 'following' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTabChange?.('following')}
          >
            팔로잉
          </Button>
        </div>

        <div className="min-h-48 max-h-80 overflow-y-auto py-1">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-destructive">{error}</p>
          ) : users.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {activeTab === 'followers' ? '아직 팔로워가 없습니다.' : '아직 팔로우한 사용자가 없습니다.'}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {users.map((user) => (
                <li key={user.userId} className="py-2.5">
                  <Link
                    href={`/@${user.userId}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-xs font-semibold text-foreground">
                      {user.profileImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.profileImage} alt={user.name} className="size-full object-cover" />
                      ) : (
                        (user.name || user.userId).slice(0, 2)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">@{user.userId}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
