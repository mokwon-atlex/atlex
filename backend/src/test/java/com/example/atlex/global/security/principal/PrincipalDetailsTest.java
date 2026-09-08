package com.example.atlex.global.security.principal;

import com.example.atlex.domain.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PrincipalDetailsTest {

    @Test
    @DisplayName("role이 null인 기존 사용자도 ROLE_USER 권한으로 처리")
    void getAuthorities_nullRole_defaultsToUser() {
        User user = User.builder()
            .userId("legacy")
            .password("pw")
            .active(true)
            .role(null)
            .build();

        Collection<? extends GrantedAuthority> authorities = new PrincipalDetails(user).getAuthorities();

        assertEquals("ROLE_USER", authorities.iterator().next().getAuthority());
    }
}
