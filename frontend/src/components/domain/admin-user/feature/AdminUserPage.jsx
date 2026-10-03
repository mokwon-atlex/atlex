'use client';

// 관리자 전체 회원 목록 화면.
// 백엔드가 페이지 없이 전체 배열을 내려주므로 받은 목록을 그대로 표로 보여준다.

import { useQuery } from '@tanstack/react-query';
import Header from '@/components/common/layout/Header';
import RequireAuth from '@/components/common/auth/RequireAuth';
import { Button } from '@/components/common/ui/button';
import { fetchAdminUsers } from '@/lib/api/users';
import { formatDotDate } from '@/lib/mappers/post';
import { useAuthStore } from '@/store/authStore';

/**
 * 관리자 권한을 확인한 뒤 회원 목록을 보여준다.
 * 화면 노출만 제어하며, 실제 권한 검사는 서버가 관리자 API에서 수행한다.
 */
function AdminUserContent() {
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: fetchAdminUsers,
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return (
      <p role="alert" className="py-16 text-center text-sm text-muted-foreground">
        관리자만 접근할 수 있는 화면입니다.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">회원 관리</h1>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">회원 목록을 불러오는 중입니다...</p>
      ) : isError ? (
        <div className="py-12 text-center">
          <p role="alert" className="mb-3 text-sm text-destructive">
            {error?.message || '회원 목록을 불러오지 못했습니다.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            다시 시도
          </Button>
        </div>
      ) : users.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">회원이 없습니다.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">전체 회원 목록 ({users.length}명)</caption>
            <thead className="border-b border-border text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  아이디
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  닉네임
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  이메일
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  상태
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  가입일
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{user.userId}</td>
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">{user.active ? '활성' : '탈퇴'}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{formatDotDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * 관리자 회원 관리 페이지. 미로그인 사용자는 로그인 화면으로 이동한다.
 * @returns {JSX.Element} 회원 목록 페이지
 */
export function AdminUserPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,var(--muted),var(--background)_45%)]">
      <Header />
      <div className="mx-auto w-full max-w-content-narrow flex-1 px-5 pb-12 pt-7 sm:px-8 lg:px-10">
        <RequireAuth>
          <AdminUserContent />
        </RequireAuth>
      </div>
    </main>
  );
}
