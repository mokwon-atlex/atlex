package com.example.atlex.domain.github.service;

import com.example.atlex.domain.github.dto.response.PostMarkdownExportResponse;
import com.example.atlex.domain.github.util.FrontmatterUtils;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.exception.PostNotFoundException;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.tag.repository.PostTagRepository;
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

    private final PostRepository postRepository;
    private final PostTagRepository postTagRepository;

    /**
     * 게시글을 Frontmatter 포함 마크다운으로 직렬화하여 반환합니다.
     * 비공개 글의 경우 작성자 본인만 접근할 수 있습니다.
     */
    @Transactional(readOnly = true)
    public PostMarkdownExportResponse exportPostMarkdown(Long postId, Long currentUserId) {
        Post post = postRepository.findWithUserById(postId)
            .orElseThrow(PostNotFoundException::new);

        if (Boolean.TRUE.equals(post.getIsDeleted())) {
            throw new PostNotFoundException();
        }

        if (Boolean.FALSE.equals(post.getIsPublic())) {
            if (currentUserId == null || !post.getUser().getId().equals(currentUserId)) {
                throw new PostNotFoundException();
            }
        }

        List<String> tags = postTagRepository.findTagNamesByPostId(postId);
        String markdown = FrontmatterUtils.buildMarkdown(post, tags);
        String filename = FrontmatterUtils.generateSafeFilename(postId, post.getTitle());

        return PostMarkdownExportResponse.builder()
            .filename(filename)
            .content(markdown)
            .build();
    }
}
