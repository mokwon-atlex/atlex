package com.example.atlex.domain.report.service;

import com.example.atlex.domain.comment.repository.CommentRepository;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.report.dto.request.ReportProcessRequest;
import com.example.atlex.domain.report.dto.response.AdminReportDetailResponse;
import com.example.atlex.domain.report.dto.response.AdminReportResponse;
import com.example.atlex.domain.report.dto.response.ReportTargetResponse;
import com.example.atlex.domain.report.entity.Report;
import com.example.atlex.domain.report.entity.ReportStatus;
import com.example.atlex.domain.report.entity.ReportTargetType;
import com.example.atlex.domain.report.exception.InvalidReportStatusException;
import com.example.atlex.domain.report.exception.ReportAlreadyProcessedException;
import com.example.atlex.domain.report.exception.ReportNotFoundException;
import com.example.atlex.domain.report.repository.ReportRepository;
import com.example.atlex.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 관리자의 신고 조회와 처리 결과 기록을 담당한다.
 */
@Service
@RequiredArgsConstructor
public class AdminReportService {

    private final ReportRepository reportRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    /**
     * 신고 목록을 조회한다.
     *
     * @param status 처리 상태 필터(null이면 전체)
     * @param targetType 신고 대상 종류 필터(null이면 전체)
     * @param pageable 페이지 정보
     * @return 신고 목록 페이지
     */
    @Transactional(readOnly = true)
    public Page<AdminReportResponse> getReports(ReportStatus status, ReportTargetType targetType, Pageable pageable) {
        return reportRepository.search(status, targetType, pageable)
            .map(AdminReportResponse::from);
    }

    /**
     * 신고 상세와 신고 대상 콘텐츠 요약을 조회한다.
     * 관리자 판단을 위해 삭제된 대상도 요약을 제공한다.
     *
     * @param reportId 신고 ID
     * @return 신고 상세
     * @throws ReportNotFoundException 신고가 없는 경우
     */
    @Transactional(readOnly = true)
    public AdminReportDetailResponse getReport(Long reportId) {
        Report report = reportRepository.findWithUsersById(reportId)
            .orElseThrow(ReportNotFoundException::new);
        return AdminReportDetailResponse.builder()
            .report(AdminReportResponse.from(report))
            .target(findTarget(report))
            .build();
    }

    /**
     * 신고 처리 결과를 기록한다. 처리 결과는 한 번만 기록할 수 있다.
     *
     * @param reportId 신고 ID
     * @param request 처리 결과와 메모
     * @param adminId 처리하는 관리자 DB ID
     * @return 처리 결과가 반영된 신고
     * @throws InvalidReportStatusException 처리 결과로 PENDING을 지정한 경우
     * @throws ReportNotFoundException 신고가 없는 경우
     * @throws ReportAlreadyProcessedException 이미 처리된 신고인 경우
     */
    @Transactional
    public AdminReportResponse processReport(Long reportId, ReportProcessRequest request, Long adminId) {
        if (!request.getStatus().isFinal()) {
            throw new InvalidReportStatusException();
        }

        Report report = reportRepository.findWithUsersById(reportId)
            .orElseThrow(ReportNotFoundException::new);
        if (!report.isPending()) {
            throw new ReportAlreadyProcessedException();
        }

        report.process(userRepository.getReferenceById(adminId), request.getStatus(), request.getResultMemo().strip());
        return AdminReportResponse.from(report);
    }

    /**
     * 신고 대상 종류에 따라 게시물 또는 댓글 요약을 조회한다.
     */
    private ReportTargetResponse findTarget(Report report) {
        if (report.getTargetType() == ReportTargetType.POST) {
            return postRepository.findById(report.getTargetId())
                .map(ReportTargetResponse::from)
                .orElse(null);
        }
        return commentRepository.findById(report.getTargetId())
            .map(ReportTargetResponse::from)
            .orElse(null);
    }
}
