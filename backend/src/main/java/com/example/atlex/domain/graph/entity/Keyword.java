package com.example.atlex.domain.graph.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "keywords")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Keyword {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Builder.Default
    @Column(nullable = false)
    private Integer documentFrequency = 0;

    public static Keyword of(String name) {
        return Keyword.builder()
                .name(name)
                .documentFrequency(0)
                .build();
    }

    public void updateDocumentFrequency(int documentFrequency) {
        this.documentFrequency = Math.max(documentFrequency, 0);
    }
}
