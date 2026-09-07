package com.example.atlex.domain.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(description = "사용자 정보 수정 요청 (수정할 필드만 전송)")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRequest {

    @Schema(description = "변경할 아이디 (4~15자, 공백 불가)", example = "newjohn456")
    @Size(min = 4, max = 15, message = "아이디는 4자 이상 15자 이하로 입력해주세요.")
    @Pattern(regexp = "^[^\\s]+$", message = "아이디에 공백을 포함할 수 없습니다.")
    private String userId;

    @Schema(description = "변경할 이메일", example = "newemail@example.com")
    @Email(message = "이메일 형식(예: user@example.com)을 확인해주세요.")
    @Pattern(
            regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$",
            message = "이메일 형식(예: user@example.com)을 확인해주세요."
    )
    private String email;

    @Schema(description = "변경할 닉네임 (2~10자, 한글/영문/숫자만 허용)", example = "새닉네임")
    @Size(min = 2, max = 10, message = "닉네임은 2자 이상 10자 이하로 입력해주세요.")
    @Pattern(
            regexp = "^[a-zA-Z가-힣0-9]*$",
            message = "한글, 영어, 숫자만 입력 가능하며 특수문자는 사용할 수 없습니다."
    )
    private String name;
}
