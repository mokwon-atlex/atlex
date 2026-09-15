package com.example.atlex.domain.user.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** 사용자 엔티티의 기본 상태를 검증하는 테스트입니다. */
class UserTest {

    /** 기본 생성자로 만든 사용자의 로그인 실패 횟수가 0인지 검증합니다. */
    @Test
    @DisplayName("기본 생성 시 로그인 실패 횟수는 0이다")
    void createWithDefaultConstructor_setsFailCountToZero() {
        User user = new User();

        assertEquals(0, user.getFailCount());
    }

    /** 빌더로 만든 사용자의 로그인 실패 횟수가 0인지 검증합니다. */
    @Test
    @DisplayName("빌더 생성 시 로그인 실패 횟수는 0이다")
    void createWithBuilder_setsFailCountToZero() {
        User user = User.builder().build();

        assertEquals(0, user.getFailCount());
    }

    /** 빌더에서 지정한 로그인 실패 횟수가 유지되는지 검증합니다. */
    @Test
    @DisplayName("빌더에서 지정한 로그인 실패 횟수는 유지된다")
    void createWithBuilder_preservesExplicitFailCount() {
        User user = User.builder().failCount(3).build();

        assertEquals(3, user.getFailCount());
    }
}
