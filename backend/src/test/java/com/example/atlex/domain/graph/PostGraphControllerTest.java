package com.example.atlex.domain.graph;

import com.example.atlex.domain.graph.entity.PostRelation;
import com.example.atlex.domain.graph.repository.PostRelationRepository;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import com.example.atlex.global.security.jwt.JwtProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.MOCK,
        properties = {
                "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
                "spring.jpa.hibernate.ddl-auto=create-drop"
        }
)
@Transactional
class PostGraphControllerTest {

    @Autowired WebApplicationContext context;
    @Autowired JwtProvider jwtProvider;
    @Autowired UserRepository userRepository;
    @Autowired PostRepository postRepository;
    @Autowired PostRelationRepository postRelationRepository;

    private MockMvc mockMvc;
    private String authorToken;
    private Long publicPostId;
    private Long privatePostId;
    private Long targetPostId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        User author = userRepository.saveAndFlush(User.builder()
                .userId("author")
                .email("author@test.com")
                .password("pw")
                .name("작성자")
                .active(true)
                .build());
        authorToken = jwtProvider.createAccessToken(author.getId());

        Post publicPost = postRepository.saveAndFlush(Post.builder()
                .user(author)
                .title("Public Spring")
                .content("spring graph")
                .isPublic(true)
                .build());
        Post targetPost = postRepository.saveAndFlush(Post.builder()
                .user(author)
                .title("Target JPA")
                .content("jpa graph")
                .isPublic(true)
                .build());
        Post privatePost = postRepository.saveAndFlush(Post.builder()
                .user(author)
                .title("Private")
                .content("private graph")
                .isPublic(false)
                .build());

        postRelationRepository.saveAndFlush(PostRelation.of(publicPost, targetPost, 0.88, "graph"));
        postRelationRepository.saveAndFlush(PostRelation.of(publicPost, privatePost, 0.90, "private"));

        publicPostId = publicPost.getId();
        targetPostId = targetPost.getId();
        privatePostId = privatePost.getId();
    }

    @Test
    @DisplayName("비로그인 그래프 조회는 공개 노드와 공개 노드 사이 엣지만 반환한다")
    void getGraph_anonymousSeesPublicNodesAndEdgesOnly() throws Exception {
        mockMvc.perform(get("/api/v1/graph"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.nodes.length()").value(2))
                .andExpect(jsonPath("$.data.edges.length()").value(1))
                .andExpect(jsonPath("$.data.edges[0].sourcePostId").value(publicPostId))
                .andExpect(jsonPath("$.data.edges[0].targetPostId").value(targetPostId));
    }

    @Test
    @DisplayName("작성자 로그인 그래프 조회는 본인 비공개 노드는 반환하지만 엣지는 공개 글 사이만 반환한다")
    void getGraph_authorSeesOwnPrivateNodesButPublicEdgesOnly() throws Exception {
        mockMvc.perform(get("/api/v1/graph")
                        .header("Authorization", "Bearer " + authorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.nodes.length()").value(3))
                .andExpect(jsonPath("$.data.edges.length()").value(1))
                .andExpect(jsonPath("$.data.nodes[?(@.id == %d)]".formatted(privatePostId)).exists());
    }

    @Test
    @DisplayName("게시글 중심 그래프 조회는 중심 게시글과 직접 연결된 공개 게시글만 반환한다")
    void getPostGraph_returnsCenterAndPublicOneHopOnly() throws Exception {
        mockMvc.perform(get("/api/v1/graph/posts/{postId}", publicPostId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.nodes.length()").value(2))
                .andExpect(jsonPath("$.data.edges.length()").value(1))
                .andExpect(jsonPath("$.data.nodes[?(@.id == %d)]".formatted(publicPostId)).exists())
                .andExpect(jsonPath("$.data.nodes[?(@.id == %d)]".formatted(targetPostId)).exists())
                .andExpect(jsonPath("$.data.nodes[?(@.id == %d)]".formatted(privatePostId)).doesNotExist())
                .andExpect(jsonPath("$.data.edges[0].sourcePostId").value(publicPostId))
                .andExpect(jsonPath("$.data.edges[0].targetPostId").value(targetPostId));
    }

    @Test
    @DisplayName("게시글 중심 그래프 조회는 중심 게시글로 들어오는 관계도 반환한다")
    void getPostGraph_includesIncomingRelation() throws Exception {
        mockMvc.perform(get("/api/v1/graph/posts/{postId}", targetPostId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.nodes.length()").value(2))
                .andExpect(jsonPath("$.data.edges.length()").value(1))
                .andExpect(jsonPath("$.data.nodes[?(@.id == %d)]".formatted(publicPostId)).exists())
                .andExpect(jsonPath("$.data.nodes[?(@.id == %d)]".formatted(targetPostId)).exists())
                .andExpect(jsonPath("$.data.edges[0].sourcePostId").value(publicPostId))
                .andExpect(jsonPath("$.data.edges[0].targetPostId").value(targetPostId));
    }

    @Test
    @DisplayName("비로그인 사용자는 비공개 게시글 중심 그래프를 조회할 수 없다")
    void getPostGraph_anonymousCannotReadPrivateCenter() throws Exception {
        mockMvc.perform(get("/api/v1/graph/posts/{postId}", privatePostId))
                .andExpect(status().isNotFound());
    }
}
