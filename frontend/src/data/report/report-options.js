// 신고 사유·상태·대상 종류의 화면 표시용 정적 데이터.
// 값(value)은 백엔드 enum(ReportReason, ReportStatus, ReportTargetType)과 동일하게 유지한다.

/** 기타 사유 값. 이 사유를 선택하면 추가 설명이 필수다. */
export const REPORT_REASON_OTHER = 'OTHER';

/** 신고 추가 설명 최대 길이(백엔드 검증과 동일). */
export const REPORT_DESCRIPTION_MAX_LENGTH = 500;

/** 관리자 처리 메모 최대 길이(백엔드 검증과 동일). */
export const REPORT_RESULT_MEMO_MAX_LENGTH = 500;

/** 사용자가 선택할 수 있는 신고 사유 목록. */
export const REPORT_REASON_OPTIONS = [
  { value: 'SPAM', label: '스팸·광고' },
  { value: 'ABUSE', label: '욕설·혐오·괴롭힘' },
  { value: 'OBSCENE', label: '음란·선정성' },
  { value: 'PRIVACY', label: '개인정보 노출' },
  { value: 'COPYRIGHT', label: '저작권 침해' },
  { value: REPORT_REASON_OTHER, label: '기타' },
];

/** 신고 처리 상태별 표시 라벨. */
export const REPORT_STATUS_LABELS = {
  PENDING: '접수',
  RESOLVED: '조치 완료',
  REJECTED: '기각',
};

/** 신고 대상 종류별 표시 라벨. */
export const REPORT_TARGET_TYPE_LABELS = {
  POST: '게시물',
  COMMENT: '댓글',
};

/**
 * 신고 사유 값을 표시 라벨로 변환한다.
 * @param {string} reason - 신고 사유 값
 * @returns {string} 표시 라벨(알 수 없는 값이면 원문)
 */
export function getReportReasonLabel(reason) {
  return REPORT_REASON_OPTIONS.find((option) => option.value === reason)?.label ?? reason;
}
