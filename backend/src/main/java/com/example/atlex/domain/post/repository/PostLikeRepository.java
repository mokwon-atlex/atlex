package com.example.atlex.domain.post.repository;

import com.example.atlex.domain.post.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    boolean existsByPost_IdAndUser_Id(Long postId, Long userId);

    // 실제 삭제된 행 수를 반환해 좋아요 취소가 카운트에 반영돼야 하는지 판단한다(멱등 처리).
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM PostLike pl WHERE pl.post.id = :postId AND pl.user.id = :userId")
    int deleteByPostIdAndUserId(@Param("postId")
    Long postId, @Param("userId")
    Long userId);
}
