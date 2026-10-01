package com.example.atlex.domain.report.entity;

/**
 * 신고 처리 상태.
 * 접수 상태에서 조치 완료 또는 기각으로 한 번만 전환되며, 처리 이후에는 변경하지 않는다.
 */
public enum ReportStatus {
    /** 접수 — 관리자 처리 대기 */
    PENDING,
    /** 조치 완료 — 신고 내용이 타당하다고 판단 */
    RESOLVED,
    /** 기각 — 신고 내용이 타당하지 않다고 판단 */
    REJECTED;

    /**
     * 관리자가 처리 결과로 지정할 수 있는 최종 상태인지 확인한다.
     *
     * @return 조치 완료 또는 기각이면 true
     */
    public boolean isFinal() {
        return this != PENDING;
    }
}
