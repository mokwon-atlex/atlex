package com.example.atlex.domain.report.service;

import com.example.atlex.domain.comment.entity.Comment;
import com.example.atlex.domain.comment.exception.CommentNotFoundException;
import com.example.atlex.domain.comment.repository.CommentRepository;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.service.PostAccessService;
import com.example.atlex.domain.report.dto.request.ReportCreateRequest;
import com.example.atlex.domain.report.dto.response.ReportResponse;
import com.example.atlex.domain.report.entity.Report;
import com.example.atlex.domain.report.entity.ReportReason;
import com.example.atlex.domain.report.entity.ReportTargetType;
import com.example.atlex.domain.report.exception.DuplicateReportException;
import com.example.atlex.domain.report.exception.ReportDescriptionRequiredException;
import com.example.atlex.domain.report.exception.SelfReportNotAllowedException;
import com.example.atlex.domain.report.repository.ReportRepository;
import com.example.atlex.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

/**
 * 사용자의 게시물·댓글 신고 접수를 담당한다.
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PostAccessService postAccessService;

    /**
     * 게시물 신고를 접수한다.
     * 삭제되었거나 접근할 수 없는 비공개 게시물은 존재를 숨기기 위해 404로 응답한다.
     *
     * @param postId 신고할 게시물 ID
     * @param request 신고 사유와 추가 설명
     * @param reporterId 신고자 DB ID
     * @return 접수된 신고
     * @throws SelfReportNotAllowedException 본인 게시물을 신고한 경우
     * @throws DuplicateReportException 이미 신고한 게시물인 경우
     */
    @Transactional
    public ReportResponse reportPost(Long postId, ReportCreateRequest request, Long reporterId) {
        Post post = postAccessService.getAccessiblePost(postId, reporterId);
        if (Objects.equals(post.getUser().getId(), reporterId)) {
            throw new SelfReportNotAllowedException();
        }
        return create(ReportTargetType.POST, postId, request, reporterId);
    }

    /**
     * 댓글 신고를 접수한다.
     * 삭제된 댓글이나 접근할 수 없는 게시물의 댓글은 404로 응답한다.
     *
     * @param commentId 신고할 댓글 ID
     * @param request 신고 사유와 추가 설명
     * @param reporterId 신고자 DB ID
     * @return 접수된 신고
     * @throws SelfReportNotAllowedException 본인 댓글을 신고한 경우
     * @throws DuplicateReportException 이미 신고한 댓글인 경우
     */
    @Transactional
    public ReportResponse reportComment(Long commentId, ReportCreateRequest request, Long reporterId) {
        Comment comment = commentRepository.findActiveWithAuthorById(commentId)
            .orElseThrow(CommentNotFoundException::new);
        // 비공개 게시물의 댓글은 게시물과 동일하게 작성자 외에는 존재를 숨긴다.
        postAccessService.getAccessiblePost(comment.getPost().getId(), reporterId);
        if (Objects.equals(comment.getUser().getId(), reporterId)) {
            throw new SelfReportNotAllowedException();
        }
        return create(ReportTargetType.COMMENT, commentId, request, reporterId);
    }

    /**
     * 사유 검증과 중복 확인 후 신고를 저장한다.
     */
    private ReportResponse create(ReportTargetType targetType, Long targetId, ReportCreateRequest request,
        Long reporterId) {
        String description = normalize(request.getDescription());
        if (request.getReason() == ReportReason.OTHER && description == null) {
            throw new ReportDescriptionRequiredException();
        }

        if (reportRepository.existsByReporter_IdAndTargetTypeAndTargetId(reporterId, targetType, targetId)) {
            throw new DuplicateReportException();
        }

        Report report = Report.builder()
            .reporter(userRepository.getReferenceById(reporterId))
            .targetType(targetType)
            .targetId(targetId)
            .reason(request.getReason())
            .description(description)
            .build();

        try {
            return ReportResponse.from(reportRepository.saveAndFlush(report));
        } catch (DataIntegrityViolationException e) {
            // 동시 요청이 existsBy 검사를 함께 통과한 경우 unique 제약 위반을 중복 신고로 변환한다.
            throw new DuplicateReportException();
        }
    }

    /**
     * 공백만 있는 설명은 입력하지 않은 것으로 취급한다.
     */
    private String normalize(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }
        return description.strip();
    }
}
