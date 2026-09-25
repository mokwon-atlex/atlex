import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { expect, waitFor } from 'storybook/test';

import { resetQueriesOnUserChange } from '@/lib/queries/user-query-cache';
import { useAuthStore } from '@/store/authStore';

const FAVORITE_KEY = ['posts', 'favorites', '1'];

/** 사용자 전환 시 쿼리 캐시 초기화를 검증하기 위한 빈 화면을 렌더링한다. */
function UserQueryCacheTestView() {
  return <div>사용자별 쿼리 캐시 초기화 검증</div>;
}

function loginAs(userId) {
  useAuthStore.setState({ isLoggedIn: true, user: { userId }, accessToken: `token-${userId}`, refreshToken: null });
}

/** A 로그인 상태에서 즐겨찾기 캐시를 채우고 구독을 시작한 뒤, 검증 함수를 실행한다. */
async function withSubscribedClient(verify) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  loginAs('user-a');
  queryClient.setQueryData(FAVORITE_KEY, { favorited: true });
  const unsubscribe = resetQueriesOnUserChange(queryClient);

  try {
    await verify(queryClient);
  } finally {
    unsubscribe();
    queryClient.clear();
    useAuthStore.getState().logout();
  }
}

/** @type { import('@storybook/nextjs-vite').Meta } */
const meta = {
  title: 'Domain/Auth/UserQueryCache',
  component: UserQueryCacheTestView,
};

export default meta;

// 로그아웃하면 이전 사용자의 캐시가 비워지는 상태
export const ResetOnLogout = {
  play: () =>
    withSubscribedClient(async (queryClient) => {
      useAuthStore.getState().logout();

      await expect(queryClient.getQueryData(FAVORITE_KEY)).toBeUndefined();
    }),
};

// 로그아웃 없이 다른 계정으로 로그인해도 이전 사용자의 캐시가 비워지는 상태
export const ResetOnAccountSwitch = {
  play: () =>
    withSubscribedClient(async (queryClient) => {
      loginAs('user-b');

      await expect(queryClient.getQueryData(FAVORITE_KEY)).toBeUndefined();
    }),
};

// 토큰 재발급처럼 같은 사용자 상태만 바뀌면 캐시를 유지하는 상태
export const KeepOnTokenRefresh = {
  play: () =>
    withSubscribedClient(async (queryClient) => {
      useAuthStore.getState().setTokens({ accessToken: 'token-refreshed' });

      await expect(queryClient.getQueryData(FAVORITE_KEY)).toEqual({ favorited: true });
    }),
};

// 화면에 떠 있는 쿼리는 이전 데이터를 버리고 바뀐 사용자 기준으로 다시 조회되는 상태
export const RefetchActiveQueryOnLogout = {
  play: () =>
    withSubscribedClient(async (queryClient) => {
      const observer = new QueryObserver(queryClient, {
        queryKey: FAVORITE_KEY,
        queryFn: () => ({ favorited: useAuthStore.getState().isLoggedIn }),
        staleTime: Infinity,
      });
      const results = [];
      const unsubscribeObserver = observer.subscribe((result) => results.push(result.data));

      try {
        await expect(observer.getCurrentResult().data).toEqual({ favorited: true });

        useAuthStore.getState().logout();

        // 로그아웃 직후 재조회 완료 전에도 이전 사용자 데이터가 비워져 있어야 한다.
        await expect(observer.getCurrentResult().data).toBeUndefined();
        await waitFor(() => expect(observer.getCurrentResult().data).toEqual({ favorited: false }));
        // 재조회 전에 이전 사용자 데이터가 다시 노출되지 않아야 한다.
        await expect(results).not.toContainEqual({ favorited: true });
      } finally {
        unsubscribeObserver();
      }
    }),
};
