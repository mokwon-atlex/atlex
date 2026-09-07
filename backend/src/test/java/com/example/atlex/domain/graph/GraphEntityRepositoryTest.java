package com.example.atlex.domain.graph;

import com.example.atlex.domain.graph.entity.Keyword;
import com.example.atlex.domain.graph.entity.PostKeyword;
import com.example.atlex.domain.graph.entity.PostRelation;
import com.example.atlex.domain.graph.repository.KeywordRepository;
import com.example.atlex.domain.graph.repository.PostKeywordRepository;
import com.example.atlex.domain.graph.repository.PostRelationRepository;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.Column;

import java.lang.reflect.Method;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.MOCK,
        properties = {
                "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
                "spring.jpa.hibernate.ddl-auto=create-drop"
        }
)
@Transactional
class GraphEntityRepositoryTest {

    @Autowired UserRepository userRepository;
    @Autowired PostRepository postRepository;
    @Autowired KeywordRepository keywordRepository;
    @Autowired PostKeywordRepository postKeywordRepository;
    @Autowired PostRelationRepository postRelationRepository;

    @Test
    @DisplayName("키워드, 게시글 키워드, 게시글 관계를 저장하고 조회한다")
    void persistsGraphEntities() {
        User user = saveUser();
        Post source = savePost(user, "Spring Graph", "Spring graph content");
        Post target = savePost(user, "JPA Graph", "JPA graph content");
        Keyword keyword = keywordRepository.save(Keyword.of("spring"));

        postKeywordRepository.save(PostKeyword.of(source, keyword, 2, 1, 0, 0.73));
        postRelationRepository.save(PostRelation.of(source, target, 0.42, "spring"));

        assertTrue(keywordRepository.findByName("spring").isPresent());
        assertEquals(1, postKeywordRepository.findByPostIdOrderByWeightDesc(source.getId()).size());
        assertEquals(1, postRelationRepository.findBySourcePostId(source.getId()).size());
    }

    @Test
    @DisplayName("게시글 기준 키워드와 관계를 삭제한다")
    void deletesGraphRowsByPostId() {
        User user = saveUser();
        Post source = savePost(user, "one", "spring");
        Post target = savePost(user, "two", "spring");
        Keyword keyword = keywordRepository.save(Keyword.of("spring"));
        postKeywordRepository.save(PostKeyword.of(source, keyword, 1, 0, 0, 0.50));
        postRelationRepository.save(PostRelation.of(source, target, 0.30, "spring"));
        postRelationRepository.save(PostRelation.of(target, source, 0.30, "spring"));

        postKeywordRepository.deleteByPostId(source.getId());
        postRelationRepository.deleteBySourcePostIdOrTargetPostId(source.getId(), source.getId());

        assertEquals(List.of(), postKeywordRepository.findByPostIdOrderByWeightDesc(source.getId()));
        assertEquals(List.of(), postRelationRepository.findBySourcePostId(source.getId()));
    }

    @Test
    @DisplayName("그래프 삭제 메서드는 벌크 JPQL 삭제 쿼리를 사용한다")
    void graphDeleteMethodsUseBulkQueries() throws NoSuchMethodException {
        Method postKeywordDelete = PostKeywordRepository.class.getMethod("deleteByPostId", Long.class);
        Method relationSourceDelete = PostRelationRepository.class.getMethod("deleteBySourcePostId", Long.class);
        Method relationPostDelete = PostRelationRepository.class.getMethod(
                "deleteBySourcePostIdOrTargetPostId",
                Long.class,
                Long.class
        );

        assertDeleteQuery(postKeywordDelete);
        assertDeleteQuery(relationSourceDelete);
        assertDeleteQuery(relationPostDelete);
    }

    @Test
    @DisplayName("공유 키워드 저장 길이는 최대 후보 키워드를 담을 수 있다")
    void sharedKeywordsLengthAllowsMaxSourceKeywords() throws NoSuchFieldException {
        Column column = PostRelation.class.getDeclaredField("sharedKeywords").getAnnotation(Column.class);

        assertNotNull(column);
        assertEquals(1000, column.length());
    }

    private void assertDeleteQuery(Method method) {
        Query query = method.getAnnotation(Query.class);

        assertNotNull(query);
        assertTrue(query.value().startsWith("DELETE FROM"));
    }

    private User saveUser() {
        return userRepository.save(User.builder()
                .userId("author")
                .email("author@test.com")
                .password("pw")
                .name("작성자")
                .active(true)
                .build());
    }

    private Post savePost(User user, String title, String content) {
        return postRepository.save(Post.builder()
                .user(user)
                .title(title)
                .content(content)
                .isPublic(true)
                .build());
    }
}
