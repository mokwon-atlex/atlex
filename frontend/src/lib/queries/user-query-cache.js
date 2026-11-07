// 로그인 사용자가 바뀌면(로그아웃·계정 전환) React Query 캐시를 초기화한다.
//
// 로그아웃은 로그아웃 버튼, 토큰 재발급 실패, 스토리지 삭제, 다른 탭 동기화 등 여러 경로에서
// 일어나지만 모두 authStore 의 user 를 바꾼다. 그래서 경로마다 정리 코드를 두지 않고
// store 구독 한 곳에서 처리한다.
//
// clear() 대신 resetQueries() 를 쓰는 이유: 화면에 떠 있는 쿼리의 데이터를 즉시 비우고
// 바뀐 사용자 기준으로 다시 조회하게 하기 위함이다. clear() 는 캐시에서 쿼리를 떼어내기만 해서,
// 이미 마운트된 컴포넌트가 이전 사용자 데이터를 계속 보여줄 수 있다.
import { useAuthStore } from '@/store/authStore';

const getUserId = (state) => state.user?.userId ?? null;

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @returns {() => void} 구독 해제 함수
 */
export function resetQueriesOnUserChange(queryClient) {
  let currentUserId = getUserId(useAuthStore.getState());

  return useAuthStore.subscribe((state) => {
    const nextUserId = getUserId(state);
    // 토큰 재발급처럼 같은 사용자의 상태만 바뀐 경우는 캐시를 유지한다.
    if (nextUserId === currentUserId) return;

    currentUserId = nextUserId;
    queryClient.resetQueries();
  });
}
