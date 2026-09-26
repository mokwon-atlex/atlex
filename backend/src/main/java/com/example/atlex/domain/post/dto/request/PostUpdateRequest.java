package com.example.atlex.domain.post.dto.request;

import com.example.atlex.global.validation.anotation.NullOrNotBlank;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Schema(description = "게시글 수정 요청 (수정할 필드만 전송)")
@Getter
@NoArgsConstructor
public class PostUpdateRequest {

    @Schema(description = "변경할 제목 (최대 200자, 선택)", example = "수정된 Spring Boot 가이드")
    @NullOrNotBlank(message = "제목은 공백일 수 없습니다.")
    @Size(max = 200, message = "제목은 200자 이하로 입력해주세요.")
    private String title;

    @Schema(description = "변경할 요약 설명 (최대 255자, 선택)", example = "수정된 요약 설명입니다.")
    @Size(max = 255, message = "설명은 255자 이하로 입력해주세요.")
    private String description;

    @Schema(description = "변경할 본문 (최대 5000자, 선택)", example = "수정된 본문 내용입니다.")
    @NullOrNotBlank(message = "내용은 공백일 수 없습니다.")
    @Size(max = 5000, message = "내용은 5000자 이하로 입력해주세요.")
    private String content;

    @Schema(description = "변경할 썸네일 URL (최대 255자, 선택)", example = "https://example.com/images/new_thumbnail.jpg")
    @Size(max = 255, message = "썸네일 URL은 255자 이하로 입력해주세요.")
    private String thumbnailUrl;

    @Schema(description = "변경할 카테고리 ID (선택, 생략하면 유지, null이면 카테고리 해제)", example = "3", nullable = true)
    private Long categoryId;

    // PATCH 에서 categoryId 생략(유지)과 명시적 null(해제)을 구분하기 위한 값.
    // Jackson 은 요청 본문에 필드가 있을 때만 setter 를 호출하므로, setter 호출 여부로 전송 여부를 판단한다.
    @JsonIgnore
    private boolean categoryIdPresent;

    @Schema(description = "변경할 태그 목록 (최대 10개, 선택, null이면 유지, 빈 리스트면 태그 전체 삭제)", example = "[\"Java\", \"Spring Boot\"]")
    @Size(max = 10, message = "태그는 최대 10개까지 입력할 수 있습니다.")
    private List<@NotBlank(message = "태그는 공백일 수 없습니다.") @Size(max = 50, message = "태그는 50자 이하로 입력해주세요.") String> tags;

    @Schema(description = "변경할 공개 여부 (선택)", example = "false")
    private Boolean isPublic;

    // 코드에서 직접 생성할 때만 사용한다. Jackson 이 이 생성자로 역직렬화하면 setter 가 호출되지 않아
    // categoryId 전송 여부를 구분할 수 없으므로 역직렬화 대상에서 제외한다.
    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    public PostUpdateRequest(
        String title,
        String description,
        String content,
        String thumbnailUrl,
        Long categoryId,
        List<String> tags,
        Boolean isPublic) {
        this.title = title;
        this.description = description;
        this.content = content;
        this.thumbnailUrl = thumbnailUrl;
        this.categoryId = categoryId;
        this.categoryIdPresent = categoryId != null;
        this.tags = tags;
        this.isPublic = isPublic;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
        this.categoryIdPresent = true;
    }

    /** 요청 본문에 categoryId 가 명시적 null 로 전송되어 카테고리를 해제해야 하는지 여부. */
    @JsonIgnore
    public boolean isCategoryCleared() {
        return categoryIdPresent && categoryId == null;
    }
}
