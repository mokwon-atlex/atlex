package com.example.atlex.domain.tag.service;

import com.example.atlex.domain.post.entity.Post;
import com.example.atlex.domain.tag.entity.Tag;
import com.example.atlex.domain.tag.repository.PostTagRepository;
import com.example.atlex.domain.user.entity.User;
import com.example.atlex.global.exception.ValidationException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostTagServiceTest {

    @Mock
    private PostTagRepository postTagRepository;

    @Mock
    private TagService tagService;

    @InjectMocks
    private PostTagService postTagService;

    @Test
    @DisplayName("게시글 태그 동기화 시 대소문자 무시 중복을 제거하고 최초 입력 표기를 유지한다")
    void syncPostTags_caseInsensitiveDistinctTags() {
        User author = User.builder().id(1L).userId("owner").name("owner").build();
        Post post = Post.builder().id(100L).user(author).title("t").content("c").isPublic(true).build();
        when(tagService.getOrCreateTag(any())).thenAnswer(inv -> Tag.of(inv.getArgument(0)));

        List<String> result = postTagService.syncPostTags(
            author,
            post,
            List.of("Java", "java", "JAVA", "Spring", "spring"));

        verify(tagService).getOrCreateTag("Java");
        verify(tagService).getOrCreateTag("Spring");
        verify(tagService, never()).getOrCreateTag("java");
        verify(tagService, never()).getOrCreateTag("JAVA");
        verify(tagService, never()).getOrCreateTag("spring");
        verify(postTagRepository).saveAll(any());
        assertEquals(List.of("Java", "Spring"), result);
    }

    @Test
    @DisplayName("게시글 태그 동기화 시 10개를 초과하면 ValidationException이 발생한다")
    void syncPostTags_exceeds10Tags_throwsValidationException() {
        User author = User.builder().id(1L).userId("owner").name("owner").build();
        Post post = Post.builder().id(100L).user(author).title("t").content("c").isPublic(true).build();
        List<String> elevenTags = List.of("t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10", "t11");

        assertThrows(ValidationException.class, () -> postTagService.syncPostTags(author, post, elevenTags));
        verify(postTagRepository, never()).saveAll(any());
    }
}
