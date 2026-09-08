package com.example.atlex.domain.category;

import com.example.atlex.global.security.jwt.JwtProvider;
import com.example.atlex.domain.category.entity.Category;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.category.repository.CategoryRepository;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Transactional
class CategoryControllerTest {

    @Autowired
    WebApplicationContext context;
    @Autowired
    JwtProvider jwtProvider;
    @Autowired
    UserRepository userRepository;
    @Autowired
    CategoryRepository categoryRepository;
    @Autowired
    PostRepository postRepository;
    @Autowired
    EntityManager entityManager;

    private MockMvc mockMvc;
    private User owner;
    private User other;
    private String ownerToken;
    private String otherToken;
    private Category oldestPublicCategory;
    private Category middlePublicCategory;
    private Category newestPublicCategory;
    private Category privateOnlyCategory;
    private Category emptyCategory;
    private Category otherCategory;
    private Long linkedPostId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
            .apply(SecurityMockMvcConfigurers.springSecurity())
            .build();

        owner = saveUser("owner", "owner@test.com");
        other = saveUser("other", "other@test.com");
        ownerToken = jwtProvider.createAccessToken(owner.getId());
        otherToken = jwtProvider.createAccessToken(other.getId());

        oldestPublicCategory = saveCategory(owner, "oldest");
        middlePublicCategory = saveCategory(owner, "middle");
        newestPublicCategory = saveCategory(owner, "newest");
        privateOnlyCategory = saveCategory(owner, "private");
        emptyCategory = saveCategory(owner, "empty");
        otherCategory = saveCategory(other, "other-category");

        savePost(owner, oldestPublicCategory, true, false, "oldest-public.png");
        savePost(owner, middlePublicCategory, true, false, "middle-public.png");
        savePost(owner, newestPublicCategory, true, false, "newest-public.png");
        linkedPostId = savePost(owner, newestPublicCategory, false, false, "newest-private.png");
        savePost(owner, privateOnlyCategory, false, false, "private-only.png");
        savePost(owner, emptyCategory, true, true, "deleted.png");
    }

    @Test
    @DisplayName("비로그인 목록도 게시글 유무와 무관하게 모든 카테고리를 id DESC로 조회한다 (count/썸네일은 공개 글 기준)")
    void getCategories_anonymous_showsAllCategories() throws Exception {
        mockMvc.perform(get("/api/v1/users/{userId}/categories", owner.getUserId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content", hasSize(5)))
            .andExpect(jsonPath("$.data.content[0].id").value(emptyCategory.getId()))
            .andExpect(jsonPath("$.data.content[0].postCount").value(0))
            .andExpect(jsonPath("$.data.content[0].thumbnailUrl").value(nullValue()))
            .andExpect(jsonPath("$.data.content[1].id").value(privateOnlyCategory.getId()))
            .andExpect(jsonPath("$.data.content[1].postCount").value(0))
            .andExpect(jsonPath("$.data.content[1].thumbnailUrl").value(nullValue()))
            .andExpect(jsonPath("$.data.content[2].id").value(newestPublicCategory.getId()))
            .andExpect(jsonPath("$.data.content[2].postCount").value(1))
            .andExpect(jsonPath("$.data.content[2].thumbnailUrl").value("newest-public.png"))
            .andExpect(jsonPath("$.data.content[3].id").value(middlePublicCategory.getId()))
            .andExpect(jsonPath("$.data.content[4].id").value(oldestPublicCategory.getId()))
            .andExpect(jsonPath("$.data.hasNext").value(false))
            .andExpect(jsonPath("$.data.nextCursor").value(nullValue()));
    }

    @Test
    @DisplayName("타인 조회도 모든 카테고리를 노출하되 count/썸네일은 공개 글 기준이다")
    void getCategories_otherUser_showsAllCategories() throws Exception {
        mockMvc.perform(get("/api/v1/users/{userId}/categories", owner.getUserId())
            .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content", hasSize(5)))
            .andExpect(jsonPath("$.data.content[1].id").value(privateOnlyCategory.getId()))
            .andExpect(jsonPath("$.data.content[1].postCount").value(0))
            .andExpect(jsonPath("$.data.content[2].postCount").value(1))
            .andExpect(jsonPath("$.data.content[2].thumbnailUrl").value("newest-public.png"));
    }

    @Test
    @DisplayName("본인 조회는 비공개 글과 게시글이 없는 카테고리도 포함한다")
    void getCategories_owner_includesPrivateAndEmpty() throws Exception {
        mockMvc.perform(get("/api/v1/users/{userId}/categories", owner.getUserId())
            .header("Authorization", "Bearer " + ownerToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content", hasSize(5)))
            .andExpect(jsonPath("$.data.content[0].id").value(emptyCategory.getId()))
            .andExpect(jsonPath("$.data.content[0].postCount").value(0))
            .andExpect(jsonPath("$.data.content[0].thumbnailUrl").value(nullValue()))
            .andExpect(jsonPath("$.data.content[1].id").value(privateOnlyCategory.getId()))
            .andExpect(jsonPath("$.data.content[1].postCount").value(1))
            .andExpect(jsonPath("$.data.content[1].thumbnailUrl").value("private-only.png"))
            .andExpect(jsonPath("$.data.content[2].id").value(newestPublicCategory.getId()))
            .andExpect(jsonPath("$.data.content[2].postCount").value(2))
            .andExpect(jsonPath("$.data.content[2].thumbnailUrl").value("newest-private.png"));
    }

    @Test
    @DisplayName("cursor pagination은 id DESC와 limit plus one 방식으로 동작한다")
    void getCategories_cursorPagination() throws Exception {
        // 비로그인 조회도 전체 5개(empty, private, newest, middle, oldest)를 id DESC로 본다.
        MvcResult firstPage = mockMvc.perform(get("/api/v1/users/{userId}/categories", owner.getUserId())
            .param("limit", "3"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content", hasSize(3)))
            .andExpect(jsonPath("$.data.content[0].id").value(emptyCategory.getId()))
            .andExpect(jsonPath("$.data.content[1].id").value(privateOnlyCategory.getId()))
            .andExpect(jsonPath("$.data.content[2].id").value(newestPublicCategory.getId()))
            .andExpect(jsonPath("$.data.hasNext").value(true))
            .andExpect(jsonPath("$.data.nextCursor").value(newestPublicCategory.getId()))
            .andReturn();

        String firstPageBody = firstPage.getResponse().getContentAsString();
        assertTrue(firstPageBody.contains("\"nextCursor\":" + newestPublicCategory.getId()));

        mockMvc.perform(get("/api/v1/users/{userId}/categories", owner.getUserId())
            .param("limit", "3")
            .param("cursor", newestPublicCategory.getId().toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content", hasSize(2)))
            .andExpect(jsonPath("$.data.content[0].id").value(middlePublicCategory.getId()))
            .andExpect(jsonPath("$.data.content[1].id").value(oldestPublicCategory.getId()))
            .andExpect(jsonPath("$.data.hasNext").value(false))
            .andExpect(jsonPath("$.data.nextCursor").value(nullValue()));
    }

    @Test
    @DisplayName("limit이 50보다 크면 50으로 제한한다")
    void getCategories_limitIsCappedAtFifty() throws Exception {
        for (int i = 0; i < 51; i++) {
            saveCategory(owner, "extra-" + i);
        }

        mockMvc.perform(get("/api/v1/users/{userId}/categories", owner.getUserId())
            .param("limit", "100")
            .header("Authorization", "Bearer " + ownerToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content", hasSize(50)))
            .andExpect(jsonPath("$.data.hasNext").value(true));
    }

    @Test
    @DisplayName("존재하지 않는 사용자 목록은 USER_NOT_FOUND를 반환한다")
    void getCategories_userNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/users/{userId}/categories", "missing"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("USER_NOT_FOUND"));
    }

    @Test
    @DisplayName("본인은 카테고리를 생성할 수 있다")
    void createCategory_owner() throws Exception {
        mockMvc.perform(post("/api/v1/users/{userId}/categories", owner.getUserId())
            .header("Authorization", "Bearer " + ownerToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"  new category  \"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.name").value("new category"));
    }

    @Test
    @DisplayName("비로그인 카테고리 생성은 401이다")
    void createCategory_anonymous() throws Exception {
        mockMvc.perform(post("/api/v1/users/{userId}/categories", owner.getUserId())
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"new\"}"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("타인 userId 경로 생성은 ACCESS_DENIED다")
    void createCategory_otherPath() throws Exception {
        mockMvc.perform(post("/api/v1/users/{userId}/categories", owner.getUserId())
            .header("Authorization", "Bearer " + otherToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"new\"}"))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }

    @Test
    @DisplayName("같은 사용자의 중복 이름은 409이고 다른 사용자는 같은 이름을 사용할 수 있다")
    void createCategory_duplicateNamePerUser() throws Exception {
        mockMvc.perform(post("/api/v1/users/{userId}/categories", owner.getUserId())
            .header("Authorization", "Bearer " + ownerToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"newest\"}"))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("DUPLICATE_CATEGORY_NAME"));

        mockMvc.perform(post("/api/v1/users/{userId}/categories", other.getUserId())
            .header("Authorization", "Bearer " + otherToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"newest\"}"))
            .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("본인은 자신의 카테고리 이름을 수정할 수 있다")
    void updateCategory_owner() throws Exception {
        mockMvc.perform(patch(
            "/api/v1/users/{userId}/categories/{categoryId}",
            owner.getUserId(),
            newestPublicCategory.getId())
            .header("Authorization", "Bearer " + ownerToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"updated\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.name").value("updated"));
    }

    @Test
    @DisplayName("해당 사용자의 소유가 아닌 categoryId 수정은 CATEGORY_NOT_FOUND다")
    void updateCategory_otherCategory() throws Exception {
        mockMvc.perform(patch(
            "/api/v1/users/{userId}/categories/{categoryId}",
            owner.getUserId(),
            otherCategory.getId())
            .header("Authorization", "Bearer " + ownerToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"updated\"}"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("CATEGORY_NOT_FOUND"));
    }

    @Test
    @DisplayName("카테고리 삭제는 게시글을 보존하고 category만 null로 변경한다")
    void deleteCategory_clearsPostCategory() throws Exception {
        mockMvc.perform(delete(
            "/api/v1/users/{userId}/categories/{categoryId}",
            owner.getUserId(),
            newestPublicCategory.getId())
            .header("Authorization", "Bearer " + ownerToken))
            .andExpect(status().isNoContent());

        entityManager.flush();
        entityManager.clear();

        assertFalse(categoryRepository.existsById(newestPublicCategory.getId()));
        Post linkedPost = postRepository.findById(linkedPostId).orElseThrow();
        assertNull(linkedPost.getCategory());
        assertFalse(linkedPost.getIsDeleted());
        assertTrue(postRepository.existsById(linkedPostId));
    }

    private User saveUser(String userId, String email) {
        return userRepository.saveAndFlush(User.builder()
            .userId(userId)
            .email(email)
            .password("pw")
            .name(userId)
            .active(true)
            .build());
    }

    private Category saveCategory(User user, String name) {
        return categoryRepository.saveAndFlush(Category.builder()
            .user(user)
            .name(name)
            .build());
    }

    private Long savePost(
        User user,
        Category category,
        boolean isPublic,
        boolean isDeleted,
        String thumbnailUrl) {
        return postRepository.saveAndFlush(Post.builder()
            .user(user)
            .category(category)
            .title(category.getName())
            .content(category.getName())
            .thumbnailUrl(thumbnailUrl)
            .isPublic(isPublic)
            .isDeleted(isDeleted)
            .build()).getId();
    }
}
