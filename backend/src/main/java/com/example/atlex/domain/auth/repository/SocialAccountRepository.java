package com.example.atlex.domain.auth.repository;

import com.example.atlex.domain.auth.entity.SocialAccount;
import com.example.atlex.domain.auth.entity.SocialProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * 소셜 계정 연동 정보 조회·저장을 담당합니다.
 */
public interface SocialAccountRepository extends JpaRepository<SocialAccount, Long> {

    @Query("SELECT sa FROM SocialAccount sa JOIN FETCH sa.user WHERE sa.provider = :provider AND sa.providerId = :providerId")
    Optional<SocialAccount> findByProviderAndProviderIdWithUser(
        @Param("provider")
        SocialProvider provider,
        @Param("providerId")
        String providerId);

    boolean existsByProviderAndProviderId(SocialProvider provider, String providerId);
}
