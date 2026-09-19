package com.example.atlex.domain.post;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;
import com.example.atlex.domain.graph.service.GraphIndexService;
import com.example.atlex.domain.post.dto.request.PostCreateRequest;
import com.example.atlex.domain.post.dto.request.PostUpdateRequest;
import com.example.atlex.domain.category.entity.Category;
import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.category.repository.CategoryRepository;
import com.example.atlex.domain.post.repository.PostRepository;
import com.example.atlex.domain.post.service.PostService;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;

import com.example.atlex.domain.tag.repository.PostTagRepository;
import com.example.atlex.domain.tag.repository.TagRepository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    PostRepository postRepository;
    @Mock
    UserRepository userRepository;
    @Mock
    CategoryRepository categoryRepository;
    @Mock
    GraphIndexService graphIndexService;
    @Mock
    PostTagRepository postTagRepository;
    @Mock
    TagRepository tagRepository;

    private PostService postService;

    @BeforeEach
    void setUp() {
        postService = new PostService(
            postRepository,
            userRepository,
            categoryRepository,
            graphIndexService,
            postTagRepository,
            tagRepository);
        lenient().when(postRepository.findAllPublic(any(), any(), any(), any(Pageable.class)))
            .thenReturn(Page.empty());
    }

    @Test
    @DisplayName("latest는 page와 size를 유지하고 createdAt DESC를 적용한다")
    void getPostList_latest() {
        Pageable request = PageRequest.of(2, 7, Sort.by(Sort.Order.asc("title")));

        postService.getPostList(" latest ", null, null, request, null);

        Pageable applied = captureAnonymousPageable();
        assertEquals(2, applied.getPageNumber());
        assertEquals(7, applied.getPageSize());
        assertSort(applied, Sort.Order.desc("createdAt"));
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "unknown", "LATEST-invalid"})
    @DisplayName("type이 없거나 유효하지 않으면 latest로 처리한다")
    void getPostList_invalidTypeFallsBackToLatest(String type) {
        postService.getPostList(type, null, null, PageRequest.of(0, 10), null);

        assertSort(captureAnonymousPageable(), Sort.Order.desc("createdAt"));
    }

    @Test
    @DisplayName("trending은 likes, hits, createdAt 순으로 DESC 정렬한다")
    void getPostList_trending() {
        Pageable request = PageRequest.of(0, 10, Sort.by(Sort.Order.asc("createdAt")));

        postService.getPostList("TRENDING", null, null, request, null);

        assertSort(
            captureAnonymousPageable(),
            Sort.Order.desc("likes"),
            Sort.Order.desc("hits"),
            Sort.Order.desc("createdAt"));
    }

    @Test
    @DisplayName("로그인 사용자는 기존 visible 조회 정책을 사용한다")
    void getPostList_authenticatedUsesVisiblePolicy() {
        when(postRepository.findAllVisibleTo(any(Long.class), isNull(), isNull(), isNull(), any(Pageable.class)))
            .thenReturn(Page.empty());

        postService.getPostList("latest", null, null, PageRequest.of(0, 10), 1L);

        verify(postRepository).findAllVisibleTo(any(Long.class), isNull(), isNull(), isNull(), any(Pageable.class));
    }

    @Test
    @DisplayName("빈 userId는 필터 없는 null로 정규화한다")
    void getPostList_blankUserIdUsesNoFilter() {
        postService.getPostList("latest", "   ", null, PageRequest.of(0, 10), null);

        verify(postRepository).findAllPublic(isNull(), isNull(), isNull(), any(Pageable.class));
    }

    @Test
    @DisplayName("tag가 주어지면 정규화하여 레포지토리에 전달한다")
    void getPostList_withTag() {
        postService.getPostList("latest", null, null, "  Java  ", PageRequest.of(0, 10), null);

        verify(postRepository).findAllPublic(isNull(), isNull(), org.mockito.ArgumentMatchers.eq("Java"),
            any(Pageable.class));
    }

    @Test
    @DisplayName("빈 tag는 null로 정규화한다")
    void getPostList_blankTagUsesNoFilter() {
        postService.getPostList("latest", null, null, "   ", PageRequest.of(0, 10), null);

        verify(postRepository).findAllPublic(isNull(), isNull(), isNull(), any(Pageable.class));
    }

    @Test
    @DisplayName("목록 조회는 원본 description이 있으면 그대로 응답한다")
    void getPostList_usesOriginalDescription() {
        String description = "original description";

        assertEquals(description, getListDescription(description, "fallback content"));
    }

    @Test
    @DisplayName("목록 조회는 description이 null이면 content 앞 50자를 응답한다")
    void getPostList_nullDescriptionUsesContent() {
        String content = "a".repeat(60);

        assertEquals(content.substring(0, 50), getListDescription(null, content));
    }

    @Test
    @DisplayName("목록 조회는 description이 빈 문자열이면 content 앞 50자를 응답한다")
    void getPostList_emptyDescriptionUsesContent() {
        String content = "b".repeat(60);

        assertEquals(content.substring(0, 50), getListDescription("", content));
    }

    @Test
    @DisplayName("목록 조회는 description이 공백이면 content 앞 50자를 응답한다")
    void getPostList_blankDescriptionUsesContent() {
        String content = "c".repeat(60);

        assertEquals(content.substring(0, 50), getListDescription("   ", content));
    }

    @Test
    @DisplayName("목록 조회 fallback content가 50자 이하이면 전체를 응답한다")
    void getPostList_shortContentUsesWholeContent() {
        String content = "short content";

        assertEquals(content, getListDescription(null, content));
    }

    @Test
    @DisplayName("목록 조회 fallback content가 50자 초과이면 정확히 50자만 응답한다")
    void getPostList_longContentUsesFirst50Characters() {
        String content = "d".repeat(51);

        String description = getListDescription(null, content);

        assertEquals(50, description.length());
        assertEquals(content.substring(0, 50), description);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "   "})
    @DisplayName("목록 조회 fallback content도 없거나 공백이면 description은 null이다")
    void getPostList_blankContentUsesNull(String content) {
        assertNull(getListDescription(null, content));
    }

    @Test
    @DisplayName("게시글 작성은 로그인 사용자 소유 조건으로 카테고리를 조회한다")
    void createPost_usesOwnedCategory() {
        User user = User.builder().id(1L).userId("owner").name("owner").build();
        Category category = Category.builder().id(10L).user(user).name("category").build();
        PostCreateRequest request = new PostCreateRequest(
            "title",
            null,
            "content",
            null,
            category.getId(),
            null,
            true);
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(categoryRepository.findByIdAndUser_Id(category.getId(), user.getId()))
            .thenReturn(Optional.of(category));
        when(postRepository.save(any(Post.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        postService.createPost(request, user.getId());

        verify(categoryRepository).findByIdAndUser_Id(category.getId(), user.getId());
    }

    @Test
    @DisplayName("게시글 작성에서 사용자 소유가 아닌 카테고리는 CATEGORY_NOT_FOUND다")
    void createPost_rejectsOtherUsersCategory() {
        User user = User.builder().id(1L).userId("owner").build();
        PostCreateRequest request = new PostCreateRequest(
            "title",
            null,
            "content",
            null,
            10L,
            null,
            true);
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(categoryRepository.findByIdAndUser_Id(10L, user.getId()))
            .thenReturn(Optional.empty());

        CustomException exception = assertThrows(
            CustomException.class,
            () -> postService.createPost(request, user.getId()));

        assertEquals(ErrorCode.CATEGORY_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    @DisplayName("게시글 작성 후 그래프 인덱스와 관계를 갱신한다")
    void createPost_refreshesGraph() {
        User user = User.builder().id(1L).userId("owner").name("owner").build();
        PostCreateRequest request = new PostCreateRequest(
            "title",
            null,
            "content",
            null,
            null,
            null,
            true);
        Post savedPost = Post.builder()
            .id(100L)
            .user(user)
            .title("title")
            .content("content")
            .isPublic(true)
            .build();
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(postRepository.save(any(Post.class))).thenReturn(savedPost);

        postService.createPost(request, user.getId());

        verify(graphIndexService).refreshPostGraph(savedPost.getId());
    }

    @Test
    @DisplayName("게시글 작성 시 태그를 저장하고 응답에 포함한다")
    void createPost_savesTags() {
        User user = User.builder().id(1L).userId("owner").name("owner").build();
        PostCreateRequest request = new PostCreateRequest(
            "title",
            null,
            "content",
            null,
            null,
            List.of("Java", " Spring ", "Java"),
            true);
        Post savedPost = Post.builder()
            .id(100L)
            .user(user)
            .title("title")
            .content("content")
            .isPublic(true)
            .build();
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(postRepository.save(any(Post.class))).thenReturn(savedPost);
        when(tagRepository.findByNameIgnoreCase("Java"))
            .thenReturn(Optional.of(com.example.atlex.domain.tag.entity.Tag.of("Java")));
        when(tagRepository.findByNameIgnoreCase("Spring")).thenReturn(Optional.empty());
        when(tagRepository.save(any(com.example.atlex.domain.tag.entity.Tag.class)))
            .thenAnswer(inv -> inv.getArgument(0));

        com.example.atlex.domain.post.dto.response.PostResponse response = postService.createPost(request,
            user.getId());

        verify(postTagRepository).saveAll(any());
        assertEquals(List.of("Java", "Spring"), response.getTags());
    }

    @Test
    @DisplayName("게시글 수정은 작성자 소유 조건으로 카테고리를 조회한다")
    void updatePost_usesAuthorsCategory() {
        User author = User.builder().id(1L).userId("owner").name("owner").build();
        Category category = Category.builder().id(10L).user(author).name("category").build();
        Post post = Post.builder()
            .id(100L)
            .user(author)
            .title("title")
            .content("content")
            .build();
        PostUpdateRequest request = new PostUpdateRequest(
            null,
            null,
            null,
            null,
            category.getId(),
            null,
            null);
        when(postRepository.findWithUserById(post.getId())).thenReturn(Optional.of(post));
        when(categoryRepository.findByIdAndUser_Id(category.getId(), author.getId()))
            .thenReturn(Optional.of(category));

        postService.updatePost(post.getId(), request, author.getId());

        verify(categoryRepository).findByIdAndUser_Id(category.getId(), author.getId());
        assertEquals(category, post.getCategory());
    }

    @Test
    @DisplayName("게시글 수정에서 작성자 소유가 아닌 카테고리는 CATEGORY_NOT_FOUND다")
    void updatePost_rejectsOtherUsersCategory() {
        User author = User.builder().id(1L).userId("owner").build();
        Post post = Post.builder()
            .id(100L)
            .user(author)
            .title("title")
            .content("content")
            .build();
        PostUpdateRequest request = new PostUpdateRequest(
            null,
            null,
            null,
            null,
            10L,
            null,
            null);
        when(postRepository.findWithUserById(post.getId())).thenReturn(Optional.of(post));
        when(categoryRepository.findByIdAndUser_Id(10L, author.getId()))
            .thenReturn(Optional.empty());

        CustomException exception = assertThrows(
            CustomException.class,
            () -> postService.updatePost(post.getId(), request, author.getId()));

        assertEquals(ErrorCode.CATEGORY_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    @DisplayName("게시글 수정 후 그래프 인덱스와 관계를 갱신한다")
    void updatePost_refreshesGraph() {
        User author = User.builder().id(1L).userId("owner").name("owner").build();
        Post post = Post.builder()
            .id(100L)
            .user(author)
            .title("old")
            .content("old content")
            .isPublic(true)
            .build();
        PostUpdateRequest request = new PostUpdateRequest(
            "new",
            null,
            "new content",
            null,
            null,
            null,
            null);
        when(postRepository.findWithUserById(post.getId())).thenReturn(Optional.of(post));

        postService.updatePost(post.getId(), request, author.getId());

        verify(graphIndexService).refreshPostGraph(post.getId());
    }

    @Test
    @DisplayName("게시글 수정 시 태그를 갱신한다")
    void updatePost_updatesTags() {
        User author = User.builder().id(1L).userId("owner").name("owner").build();
        Post post = Post.builder()
            .id(100L)
            .user(author)
            .title("old")
            .content("old content")
            .isPublic(true)
            .build();
        PostUpdateRequest request = new PostUpdateRequest(
            null,
            null,
            null,
            null,
            null,
            List.of("Backend", "Spring"),
            null);
        when(postRepository.findWithUserById(post.getId())).thenReturn(Optional.of(post));
        when(tagRepository.findByNameIgnoreCase("Backend")).thenReturn(Optional.empty());
        when(tagRepository.findByNameIgnoreCase("Spring")).thenReturn(Optional.empty());
        when(tagRepository.save(any(com.example.atlex.domain.tag.entity.Tag.class)))
            .thenAnswer(inv -> inv.getArgument(0));
        when(postTagRepository.findTagNamesByPostId(post.getId())).thenReturn(List.of("Backend", "Spring"));

        com.example.atlex.domain.post.dto.response.PostResponse response = postService.updatePost(post.getId(), request,
            author.getId());

        verify(postTagRepository).deleteByPostId(post.getId());
        verify(postTagRepository).saveAll(any());
        assertEquals(List.of("Backend", "Spring"), response.getTags());
    }

    @Test
    @DisplayName("게시글 상세 조회 시 태그를 반환한다")
    void getPost_returnsTags() {
        User author = User.builder().id(1L).userId("owner").name("owner").build();
        Post post = Post.builder()
            .id(100L)
            .user(author)
            .title("title")
            .content("content")
            .isPublic(true)
            .build();
        when(postRepository.findWithUserById(post.getId())).thenReturn(Optional.of(post));
        when(postTagRepository.findTagNamesByPostId(post.getId())).thenReturn(List.of("Java", "JPA"));

        com.example.atlex.domain.post.dto.response.PostResponse response = postService.getPost(post.getId(),
            author.getId());

        assertEquals(List.of("Java", "JPA"), response.getTags());
    }

    @Test
    @DisplayName("게시글 삭제 후 그래프 데이터를 제거한다")
    void deletePost_removesGraph() {
        User author = User.builder().id(1L).userId("owner").name("owner").build();
        Post post = Post.builder()
            .id(100L)
            .user(author)
            .title("title")
            .content("content")
            .isPublic(true)
            .build();
        when(postRepository.findWithUserById(post.getId())).thenReturn(Optional.of(post));

        postService.deletePost(post.getId(), author.getId());

        verify(graphIndexService).removePostGraph(post.getId());
    }

    private String getListDescription(String description, String content) {
        User author = User.builder()
            .id(1L)
            .userId("author")
            .name("author")
            .build();
        Post post = Post.builder()
            .id(1L)
            .user(author)
            .title("title")
            .description(description)
            .content(content)
            .build();
        when(postRepository.findAllPublic(isNull(), isNull(), isNull(), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(post)));

        return postService.getPostList(
            "latest",
            null,
            null,
            PageRequest.of(0, 10),
            null)
            .getContent()
            .get(0)
            .getDescription();
    }

    private Pageable captureAnonymousPageable() {
        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(postRepository).findAllPublic(isNull(), isNull(), isNull(), captor.capture());
        return captor.getValue();
    }

    private void assertSort(Pageable pageable, Sort.Order... expected) {
        List<Sort.Order> actual = pageable.getSort().stream().toList();
        assertEquals(List.of(expected), actual);
    }
}
