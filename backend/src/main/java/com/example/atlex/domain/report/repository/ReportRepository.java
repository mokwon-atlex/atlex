package com.example.atlex.domain.report.repository;

import com.example.atlex.domain.report.entity.Report;
import com.example.atlex.domain.report.entity.ReportStatus;
import com.example.atlex.domain.report.entity.ReportTargetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * 신고 조회·저장 Repository.
 */
public interface ReportRepository extends JpaRepository<Report, Long> {

    /**
     * 동일 사용자가 같은 대상을 이미 신고했는지 확인한다.
     *
     * @param reporterId 신고자 DB ID
     * @param targetType 신고 대상 종류
     * @param targetId 신고 대상 ID
     * @return 이미 신고했으면 true
     */
    boolean existsByReporter_IdAndTargetTypeAndTargetId(Long reporterId, ReportTargetType targetType, Long targetId);

    /**
     * 관리자 신고 목록을 조회한다. 조건 값이 null이면 해당 조건을 적용하지 않는다.
     *
     * @param status 처리 상태 필터
     * @param targetType 신고 대상 종류 필터
     * @param pageable 페이지 정보
     * @return 신고자와 처리자를 함께 로딩한 신고 페이지
     */
    @EntityGraph(attributePaths = {"reporter", "processedBy"})
    @Query("SELECT r FROM Report r " +
        "WHERE (:status IS NULL OR r.status = :status) " +
        "AND (:targetType IS NULL OR r.targetType = :targetType)")
    Page<Report> search(@Param("status")
    ReportStatus status, @Param("targetType")
    ReportTargetType targetType, Pageable pageable);

    /**
     * 신고자와 처리자를 함께 로딩해 단건 조회한다.
     *
     * @param id 신고 ID
     * @return 신고
     */
    @EntityGraph(attributePaths = {"reporter", "processedBy"})
    @Query("SELECT r FROM Report r WHERE r.id = :id")
    Optional<Report> findWithUsersById(@Param("id")
    Long id);
}
