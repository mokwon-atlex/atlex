// 관리자 신고 화면에서 사용하는 표시 형식 변환 함수.

/**
 * ISO 날짜 문자열을 `YYYY.MM.DD HH:mm` 형식으로 변환한다.
 * @param {string|null} iso - ISO 날짜 문자열
 * @returns {string} 포맷팅된 날짜(값이 없거나 잘못되면 '-')
 */
export function formatReportDate(iso) {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
