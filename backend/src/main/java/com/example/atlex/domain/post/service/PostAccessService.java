package com.example.atlex.domain.post.service;

import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.exception.PostNotFoundException;
import com.example.atlex.domain.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class PostAccessService {

    private final PostRepository postRepository;

    // 게시글 접근 정책 공통화: 존재하지 않음/soft delete → 404, 비공개 글은 작성자가 아니면 404로 존재를 숨긴다(getPost와 동일).
    public Post getAccessiblePost(Long postId, Long userId) {
        Post post = postRepository.findWithUserById(postId)
            .orElseThrow(PostNotFoundException::new);

        if (!Boolean.TRUE.equals(post.getIsPublic()) && !Objects.equals(post.getUser().getId(), userId)) {
            throw new PostNotFoundException();
        }
        return post;
    }
}
