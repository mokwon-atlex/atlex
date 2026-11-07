package com.example.atlex.domain.report.entity;

/**
 * 사용자가 선택하는 신고 사유 분류.
 * {@link #OTHER}를 선택하면 추가 설명을 반드시 입력해야 한다.
 */
public enum ReportReason {
    /** 스팸·광고 */
    SPAM,
    /** 욕설·혐오·괴롭힘 */
    ABUSE,
    /** 음란·선정성 */
    OBSCENE,
    /** 개인정보 노출 */
    PRIVACY,
    /** 저작권 침해 */
    COPYRIGHT,
    /** 기타 */
    OTHER
}
