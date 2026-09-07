package com.example.atlex.domain.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {
    @Id
    private Long id; // User PK (Long)

    @Column(nullable = false)
    private String token;

    @Column(nullable = false)
    private LocalDateTime expiredDate;

    public void updateToken(String newToken, LocalDateTime newExpiredDate) {
        this.token = newToken;
        this.expiredDate = newExpiredDate;
    }
}
