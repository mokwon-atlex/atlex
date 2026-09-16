import Header from '@/components/common/layout/Header';
import GraphViewPage from '@/components/domain/graph-view/feature/GraphViewPage';

export const metadata = {
  title: 'Graph View',
  description: '게시글 관계 그래프',
};

/** URL 조회 조건을 그래프 화면이 사용할 수 있는 값으로 정리한다. */
function toOptionalNumber(value) {
  const number = Number(value);

  return Number.isInteger(number) && number > 0 ? number : undefined;
}

/** 그래프 API가 받는 0 이상 점수 값만 전달한다. */
function toOptionalScore(value) {
  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

/**
 * URL의 userId, categoryId, minScore, postId 조건을 그래프 API 요청으로 전달한다.
 *
 * @param {{ searchParams: Promise<Record<string, string | string[] | undefined>> }} props 페이지 매개변수
 */
export default async function StandaloneGraphPage({ searchParams }) {
  const params = await searchParams;
  const userId = typeof params?.userId === 'string' && params.userId.trim() ? params.userId : undefined;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <GraphViewPage
        categoryId={toOptionalNumber(params?.categoryId)}
        minScore={toOptionalScore(params?.minScore)}
        postId={toOptionalNumber(params?.postId)}
        userId={userId}
      />
    </main>
  );
}
