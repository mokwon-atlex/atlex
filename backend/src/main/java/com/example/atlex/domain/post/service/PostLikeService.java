package com.example.atlex.domain.post.service;

import com.example.atlex.domain.post.dto.response.PostLikeResponse;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.entity.PostLike;
import com.example.atlex.domain.post.repository.PostLikeRepository;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostLikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostAccessService postAccessService;

    @Transactional
    public PostLikeResponse like(Long postId, Long userId) {
        Post post = postAccessService.getAccessiblePost(postId, userId);

        // 이미 좋아요한 경우 멱등하게 현재 상태를 반환(카운트 중복 증가 방지).
        if (postLikeRepository.existsByPost_IdAndUser_Id(postId, userId)) {
            return PostLikeResponse.of(postId, true, post.getLikes());
        }

        try {
            postLikeRepository.saveAndFlush(PostLike.builder()
                    .post(post)
                    .user(userRepository.getReferenceById(userId))
                    .build());
        } catch (DataIntegrityViolationException e) {
            // 순차 중복은 위 existsBy로 이미 걸러진다. 여기 도달하는 것은 "진짜 동시 요청"이 (user_id, post_id)
            // unique 제약을 동시에 위반한 경우다. 이때 saveAndFlush의 실패로 현재 트랜잭션이 rollback-only로
            // 마킹되므로, 이 catch에서 정상 응답을 반환해도 커밋 시점에 500으로 끝날 수 있다(재시도 시 existsBy
            // 경로로 멱등하게 200 처리됨). 카운트 중복 증가는 없고 DB 무결성은 유지된다.
            return PostLikeResponse.of(postId, true, post.getLikes());
        }

        postRepository.increaseLikes(postId);
        return PostLikeResponse.of(postId, true, postRepository.findLikesByPostId(postId));
    }

    @Transactional
    public PostLikeResponse unlike(Long postId, Long userId) {
        Post post = postAccessService.getAccessiblePost(postId, userId);

        // 실제로 삭제된 행이 있을 때만 카운트를 감소시킨다(안 눌렀으면 에러 없이 멱등 처리).
        int deleted = postLikeRepository.deleteByPostIdAndUserId(postId, userId);
        if (deleted > 0) {
            postRepository.decreaseLikes(postId);
            return PostLikeResponse.of(postId, false, postRepository.findLikesByPostId(postId));
        }

        return PostLikeResponse.of(postId, false, post.getLikes());
    }
}
