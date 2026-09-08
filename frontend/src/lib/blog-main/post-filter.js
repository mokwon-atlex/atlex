// 블로그 메인 화면 필터별 게시글 필터링 유틸입니다.

function isToday(dateString) {
  const today = new Date();
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return false;

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function filterPostsByMainFilter(posts, filterId) {
  // 새로 올라온 글
  // 오늘 작성된 게시글만 표시합니다.
  if (filterId === 'latest') {
    return posts.filter((post) => isToday(post.createdAt));
  }

  return posts;
}
