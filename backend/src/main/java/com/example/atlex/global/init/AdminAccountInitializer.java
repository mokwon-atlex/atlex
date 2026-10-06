package com.example.atlex.global.init;

import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.entity.UserRole;
import com.example.atlex.domain.user.entity.MembershipTier;
import com.example.atlex.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminAccountInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        String adminId = "admin";
        
        if (!userRepository.existsByUserId(adminId)) {
            log.info("기본 관리자 계정(admin)이 존재하지 않아 새로 생성합니다.");
            
            User adminUser = User.builder()
                .userId(adminId)
                .email("admin@atlexa.com")
                .password(passwordEncoder.encode("admin1234!"))
                .name("관리자")
                .role(UserRole.ADMIN)
                .membershipTier(MembershipTier.PREMIUM)
                .termsAgreed(true)
                .privacyAgreed(true)
                .marketingAgreed(false)
                .agreedAt(LocalDateTime.now())
                .active(true)
                .build();
                
            userRepository.save(adminUser);
            log.info("관리자 계정 생성 완료: ID={}, Password={}", adminId, "admin1234!");
        } else {
            log.info("기본 관리자 계정(admin)이 이미 존재합니다.");
        }
    }
}
