package com.example.atlex.global.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 현재 시각을 제공하는 {@link Clock} 설정입니다.
 * 시간에 따라 결과가 달라지는 로직이 테스트에서 고정 시각을 사용할 수 있도록 시계를 Bean으로 분리합니다.
 */
@Configuration
public class ClockConfig {

    /**
     * 서버 기본 시간대의 시스템 시계를 반환합니다.
     *
     * @return 시스템 시계
     */
    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();
    }
}
