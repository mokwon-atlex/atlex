package com.example.atlex.domain.graph.service;

import com.example.atlex.domain.graph.entity.Keyword;
import com.example.atlex.domain.graph.entity.PostKeyword;
import com.example.atlex.domain.graph.entity.PostRelation;
import com.example.atlex.domain.graph.keyword.KeywordExtractor;
import com.example.atlex.domain.graph.keyword.entity.KeywordOccurrence;
import com.example.atlex.domain.graph.keyword.KeywordWeightCalculator;
import com.example.atlex.domain.graph.repository.KeywordRepository;
import com.example.atlex.domain.graph.repository.PostKeywordRepository;
import com.example.atlex.domain.graph.repository.PostRelationRepository;
import com.example.atlex.domain.graph.repository.projection.KeywordDocumentFrequencyProjection;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.exception.PostNotFoundException;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.tag.repository.PostTagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionOperations;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GraphIndexService {

    private static final int MAX_SOURCE_KEYWORDS = 8;
    private static final int MAX_CANDIDATES = 50;
    private static final int TOP_K = 5;
    private static final double MIN_SCORE = 0.15;

    private final PostRepository postRepository;
    private final PostTagRepository postTagRepository;
    private final KeywordRepository keywordRepository;
    private final PostKeywordRepository postKeywordRepository;
    private final PostRelationRepository postRelationRepository;
    private final KeywordExtractor keywordExtractor;
    private final KeywordWeightCalculator keywordWeightCalculator;
    private final TransactionOperations transactionOperations;

    @Transactional
    public void refreshPostGraph(Long postId) {
        refreshPostKeywords(postId);
        refreshRelations(postId);
    }

    @Transactional
    public void removePostGraph(Long postId) {
        postKeywordRepository.deleteByPostId(postId);
        postRelationRepository.deleteBySourcePostIdOrTargetPostId(postId, postId);
    }

    public int rebuildPublicGraph() {
        List<Long> postIds = postRepository.findAllPublicGraphSourcePosts()
                .stream()
                .map(Post::getId)
                .toList();

        postIds.forEach(postId -> transactionOperations.executeWithoutResult(
                ignored -> refreshPostKeywords(postId)
        ));
        postIds.forEach(postId -> transactionOperations.executeWithoutResult(
                ignored -> refreshRelations(postId)
        ));

        return postIds.size();
    }

    @Transactional
    public void refreshPostKeywords(Long postId) {
        Post post = postRepository.findWithUserById(postId)
                .orElseThrow(PostNotFoundException::new);

        postKeywordRepository.deleteByPostId(postId);
        if (Boolean.TRUE.equals(post.getIsDeleted()) || !Boolean.TRUE.equals(post.getIsPublic())) {
            return;
        }

        List<String> tagNames = postTagRepository.findTagNamesByPostId(postId);
        Map<String, KeywordOccurrence> occurrences = keywordExtractor.extract(
                post.getTitle(),
                post.getContent(),
                tagNames
        );
        long totalPosts = Math.max(postRepository.countByIsDeletedFalseAndIsPublicTrue(), 1L);
        List<String> keywordNames = occurrences.keySet().stream().toList();
        KeywordResolution keywordResolution = findOrCreateKeywords(keywordNames);
        Map<Long, Long> documentFrequencyByKeywordId = countDocumentFrequencies(
                keywordResolution.existingKeywordIds()
        );

        List<PostKeyword> postKeywords = new ArrayList<>();
        for (KeywordOccurrence occurrence : occurrences.values()) {
            Keyword keyword = keywordResolution.keywordsByName().get(occurrence.keyword());
            long otherDocumentFrequency = keyword.getId() == null
                    ? 0L
                    : documentFrequencyByKeywordId.getOrDefault(keyword.getId(), 0L);
            int documentFrequency = Math.toIntExact(otherDocumentFrequency + 1);
            keyword.updateDocumentFrequency(documentFrequency);
            double weight = keywordWeightCalculator.calculate(occurrence, totalPosts, documentFrequency);
            postKeywords.add(PostKeyword.of(
                    post,
                    keyword,
                    occurrence.titleCount(),
                    occurrence.contentCount(),
                    occurrence.tagCount(),
                    weight
            ));
        }

        postKeywordRepository.saveAll(postKeywords);
    }

    @Transactional
    public void refreshRelations(Long postId) {
        Post sourcePost = postRepository.findWithUserById(postId)
                .orElseThrow(PostNotFoundException::new);

        postRelationRepository.deleteBySourcePostId(postId);
        if (Boolean.TRUE.equals(sourcePost.getIsDeleted()) || !Boolean.TRUE.equals(sourcePost.getIsPublic())) {
            return;
        }

        List<PostKeyword> sourceKeywords = postKeywordRepository.findByPostIdOrderByWeightDesc(postId)
                .stream()
                .limit(MAX_SOURCE_KEYWORDS)
                .toList();
        if (sourceKeywords.isEmpty()) {
            return;
        }

        List<String> sourceKeywordNames = sourceKeywords.stream()
                .map(postKeyword -> postKeyword.getKeyword().getName())
                .toList();
        Map<String, PostKeyword> sourceByKeyword = new LinkedHashMap<>();
        for (PostKeyword sourceKeyword : sourceKeywords) {
            sourceByKeyword.put(sourceKeyword.getKeyword().getName(), sourceKeyword);
        }

        List<PostKeyword> candidateKeywords = postKeywordRepository.findPublicCandidatesByKeywordNames(
                postId,
                sourceKeywordNames,
                PageRequest.of(0, MAX_CANDIDATES)
        );

        double sourceTotalWeight = sourceKeywords.stream()
                .mapToDouble(PostKeyword::getWeight)
                .sum();
        Map<Long, CandidateScore> scores = new LinkedHashMap<>();

        for (PostKeyword candidateKeyword : candidateKeywords) {
            String keywordName = candidateKeyword.getKeyword().getName();
            PostKeyword sourceKeyword = sourceByKeyword.get(keywordName);
            if (sourceKeyword == null) {
                continue;
            }

            CandidateScore candidateScore = scores.computeIfAbsent(
                    candidateKeyword.getPost().getId(),
                    ignored -> new CandidateScore(candidateKeyword.getPost(), sourceTotalWeight)
            );
            candidateScore.add(keywordName, sourceKeyword.getWeight(), candidateKeyword.getWeight());
        }

        List<PostRelation> relations = scores.values().stream()
                .map(candidateScore -> candidateScore.toRelation(sourcePost))
                .filter(relation -> relation.getScore() >= MIN_SCORE)
                .sorted(Comparator.comparing(PostRelation::getScore).reversed())
                .limit(TOP_K)
                .toList();

        postRelationRepository.saveAll(relations);
    }

    private KeywordResolution findOrCreateKeywords(List<String> keywordNames) {
        Map<String, Keyword> keywordsByName = new LinkedHashMap<>();
        List<Keyword> existingKeywords = keywordRepository.findAllByNameIn(keywordNames);
        existingKeywords.forEach(keyword -> keywordsByName.put(keyword.getName(), keyword));

        List<Keyword> newKeywords = keywordNames.stream()
                .filter(keywordName -> !keywordsByName.containsKey(keywordName))
                .map(Keyword::of)
                .toList();
        if (!newKeywords.isEmpty()) {
            keywordRepository.saveAll(newKeywords)
                    .forEach(keyword -> keywordsByName.put(keyword.getName(), keyword));
        }
        List<Long> existingKeywordIds = existingKeywords.stream()
                .map(Keyword::getId)
                .filter(id -> id != null)
                .toList();
        return new KeywordResolution(keywordsByName, existingKeywordIds);
    }

    private Map<Long, Long> countDocumentFrequencies(List<Long> existingKeywordIds) {
        if (existingKeywordIds.isEmpty()) {
            return Map.of();
        }

        Map<Long, Long> documentFrequencyByKeywordId = new LinkedHashMap<>();
        for (KeywordDocumentFrequencyProjection projection
                : postKeywordRepository.countPublicDocumentsByKeywordIds(existingKeywordIds)) {
            documentFrequencyByKeywordId.put(projection.getKeywordId(), projection.getDocumentFrequency());
        }
        return documentFrequencyByKeywordId;
    }

    private record KeywordResolution(
            Map<String, Keyword> keywordsByName,
            List<Long> existingKeywordIds
    ) {
    }

    private static class CandidateScore {
        private final Post targetPost;
        private final double sourceTotalWeight;
        private final List<String> sharedKeywords = new ArrayList<>();
        private double matchedWeight;

        private CandidateScore(Post targetPost, double sourceTotalWeight) {
            this.targetPost = targetPost;
            this.sourceTotalWeight = sourceTotalWeight;
        }

        private void add(String keywordName, double sourceWeight, double targetWeight) {
            sharedKeywords.add(keywordName);
            matchedWeight += Math.min(sourceWeight, targetWeight);
        }

        private PostRelation toRelation(Post sourcePost) {
            double score = sourceTotalWeight == 0.0 ? 0.0 : matchedWeight / sourceTotalWeight;
            return PostRelation.of(sourcePost, targetPost, score, String.join(",", sharedKeywords));
        }
    }
}
