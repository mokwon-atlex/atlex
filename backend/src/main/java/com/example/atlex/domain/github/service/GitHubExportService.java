package com.example.atlex.domain.github.service;

import com.example.atlex.domain.github.dto.response.PostMarkdownExportResponse;
import com.example.atlex.domain.github.util.FrontmatterUtils;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.service.PostAccessService;
import com.example.atlex.domain.tag.service.PostTagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 게시글을 YAML Frontmatter가 포함된 마크다운(.md) 파일 형태로 내보내는 서비스입니다.
 */
@Service
@RequiredArgsConstructor
public class GitHubExportService {

    private final PostAccessService postAccessService;
    private final PostTagService postTagService;

    /**
     * 게시글을 Frontmatter 포함 마크다운으로 직렬화하여 반환합니다.
     * 비공개 글의 경우 작성자 본인만 접근할 수 있습니다.
     */
    @Transactional(readOnly = true)
    public PostMarkdownExportResponse exportPostMarkdown(Long postId, Long currentUserId) {
        Post post = postAccessService.getAccessiblePost(postId, currentUserId);

        List<String> tags = postTagService.findTagNamesByPostId(postId);
        String markdown = FrontmatterUtils.buildMarkdown(post, tags);
        String filename = FrontmatterUtils.generateSafeFilename(postId, post.getTitle());

        return PostMarkdownExportResponse.builder()
            .filename(filename)
            .content(markdown)
            .build();
    }
}
