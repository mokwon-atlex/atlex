package com.example.atlex.domain.graph.repository;

import com.example.atlex.domain.graph.entity.Keyword;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface KeywordRepository extends JpaRepository<Keyword, Long> {
    Optional<Keyword> findByName(String name);

    List<Keyword> findAllByNameIn(Collection<String> names);
}
