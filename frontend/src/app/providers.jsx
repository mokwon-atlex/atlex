'use client';

// TanStack Query 클라이언트 Provider (Next.js App Router 권장 패턴).
// - 서버: 매 요청마다 새 QueryClient 생성 (요청/사용자 간 캐시 공유 방지).
// - 브라우저: 싱글톤으로 1회만 생성. 초기 렌더 중 Suspense 재시도로 client 가
//   재생성되어 캐시가 유실되는 것을 막는다(useState 방식의 엣지케이스 회피).
import { QueryClient, QueryClientProvider, isServer } from '@tanstack/react-query';
// authStore 모듈을 여기서 한 번 로드해, apiClient 토큰 getter 주입(authStore.js 의 모듈
// side-effect)이 "모든 라우트"에서 보장되도록 한다. Providers 는 루트 레이아웃에 있어 항상 로드된다.
// (이게 없으면 authStore 를 import 하지 않는 페이지 — 예: /write — 직접 로드 시 토큰 getter 가
//  주입되지 않아, 요청에 Authorization 헤더가 안 붙어 401 이 난다.)
import '@/store/authStore';
import { resetQueriesOnUserChange } from '@/lib/queries/user-query-cache';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
    // 로그아웃·계정 전환 시 이전 사용자 데이터가 화면에 남지 않도록 캐시를 초기화한다. (#97)
    resetQueriesOnUserChange(browserQueryClient);
  }
  return browserQueryClient;
}

export function Providers({ children }) {
  const queryClient = getQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
