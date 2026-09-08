// 블로그 메인 페이지 전용 기간 필터 유틸입니다.
// 공통 게시글 조회 함수(queryPosts)는 수정하지 않고, 메인 화면에서만 사용합니다.

function getStartOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

export function getPeriodRange(period) {
  const today = getStartOfToday();

  if (period === 'week') {
    const startDate = new Date(today);

    // 월요일을 한 주의 시작으로 계산합니다.
    // getDay(): 일요일 0, 월요일 1, ... 토요일 6
    const day = startDate.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    startDate.setDate(startDate.getDate() + diffToMonday);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);

    return { startDate, endDate };
  }

  if (period === 'month') {
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    return { startDate, endDate };
  }

  return null;
}

export function isPostInPeriod(post, period) {
  if (!period || period === 'all') return true;

  const range = getPeriodRange(period);
  if (!range) return true;

  const createdAt = new Date(post.createdAt);
  if (Number.isNaN(createdAt.getTime())) return false;

  return createdAt >= range.startDate && createdAt < range.endDate;
}
