package com.example.atlex.domain.report;

import com.example.atlex.domain.comment.repository.CommentRepository;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.service.PostAccessService;
import com.example.atlex.domain.report.dto.request.ReportCreateRequest;
import com.example.atlex.domain.report.entity.Report;
import com.example.atlex.domain.report.entity.ReportReason;
import com.example.atlex.domain.report.entity.ReportTargetType;
import com.example.atlex.domain.report.repository.ReportRepository;
import com.example.atlex.domain.report.service.ReportService;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    ReportRepository reportRepository;
    @Mock
    CommentRepository commentRepository;
    @Mock
    UserRepository userRepository;
    @Mock
    PostAccessService postAccessService;

    @InjectMocks
    ReportService reportService;

    private Post postOf(Long ownerId) {
        User owner = User.builder().id(ownerId).userId("owner").build();
        return Post.builder().id(10L).user(owner).title("t").content("c").build();
    }

    @Test
    @DisplayName("동시 요청으로 unique 제약을 위반하면 DUPLICATE_REPORT로 변환한다")
    void reportPost_concurrentDuplicate() {
        when(postAccessService.getAccessiblePost(10L, 2L)).thenReturn(postOf(1L));
        when(reportRepository.existsByReporter_IdAndTargetTypeAndTargetId(2L, ReportTargetType.POST, 10L))
            .thenReturn(false);
        when(reportRepository.saveAndFlush(any(Report.class)))
            .thenThrow(new DataIntegrityViolationException("uk_reports_reporter_target"));

        CustomException e = assertThrows(CustomException.class,
            () -> reportService.reportPost(10L, new ReportCreateRequest(ReportReason.SPAM, null), 2L));

        assertEquals(ErrorCode.DUPLICATE_REPORT, e.getErrorCode());
    }

    @Test
    @DisplayName("공백만 있는 설명은 저장하지 않고 앞뒤 공백은 제거한다")
    void reportPost_normalizesDescription() {
        when(postAccessService.getAccessiblePost(10L, 2L)).thenReturn(postOf(1L));
        when(reportRepository.saveAndFlush(any(Report.class))).thenAnswer(inv -> inv.getArgument(0));

        reportService.reportPost(10L, new ReportCreateRequest(ReportReason.SPAM, "   "), 2L);
        reportService.reportPost(10L, new ReportCreateRequest(ReportReason.OTHER, "  반복 도배  "), 2L);

        ArgumentCaptor<Report> captor = ArgumentCaptor.forClass(Report.class);
        verify(reportRepository, times(2)).saveAndFlush(captor.capture());
        assertNull(captor.getAllValues().get(0).getDescription());
        assertEquals("반복 도배", captor.getAllValues().get(1).getDescription());
    }
}
