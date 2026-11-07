package com.example.atlex.domain.tag.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.atlex.domain.tag.entity.Tag;
import com.example.atlex.domain.tag.repository.PostTagRepository;
import com.example.atlex.domain.tag.repository.TagRepository;
import com.example.atlex.domain.user.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

@ExtendWith(MockitoExtension.class)
class TagServiceTest {

    @Mock
    private PostTagRepository postTagRepository;

    @Mock
    private TagRepository tagRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TagService tagService;

    @Test
    @DisplayName("이미 존재하는 태그는 새로 저장하지 않고 기존 태그를 반환한다")
    void getOrCreateTag_existingTag_returnsFound() {
        Tag existing = Tag.of("Java");
        when(tagRepository.findByNameIgnoreCase("java")).thenReturn(Optional.of(existing));

        Tag result = tagService.getOrCreateTag("java");

        assertEquals(existing, result);
        verify(tagRepository, times(0)).saveAndFlush(any());
    }

    @Test
    @DisplayName("존재하지 않는 태그는 새로 저장하여 반환한다")
    void getOrCreateTag_newTag_savesAndReturns() {
        when(tagRepository.findByNameIgnoreCase("Spring")).thenReturn(Optional.empty());
        Tag saved = Tag.of("Spring");
        when(tagRepository.saveAndFlush(any(Tag.class))).thenReturn(saved);

        Tag result = tagService.getOrCreateTag("Spring");

        assertNotNull(result);
        assertEquals("Spring", result.getName());
        verify(tagRepository).saveAndFlush(any(Tag.class));
    }

    @Test
    @DisplayName("동시 생성으로 DataIntegrityViolationException 발생 시 재조회하여 반환한다")
    void getOrCreateTag_concurrencyConflict_reFetchesTag() {
        Tag existingAfterConflict = Tag.of("Docker");
        // 첫 번째 조회: 없음
        // 두 번째 조회(예외 발생 후): 다른 트랜잭션이 저장 완료한 태그 발견
        when(tagRepository.findByNameIgnoreCase("Docker"))
            .thenReturn(Optional.empty())
            .thenReturn(Optional.of(existingAfterConflict));

        when(tagRepository.saveAndFlush(any(Tag.class)))
            .thenThrow(new DataIntegrityViolationException("Unique constraint violation"));

        Tag result = tagService.getOrCreateTag("Docker");

        assertEquals(existingAfterConflict, result);
        verify(tagRepository, times(2)).findByNameIgnoreCase("Docker");
    }
}
