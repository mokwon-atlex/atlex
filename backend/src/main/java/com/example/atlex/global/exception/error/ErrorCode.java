package com.example.atlex.global.exception.error;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 400 Bad Request - 입력값 검증 실패
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "입력값이 올바르지 않습니다."),
    TERMS_NOT_AGREED(HttpStatus.BAD_REQUEST, "이용약관에 동의해주세요."),
    PRIVACY_NOT_AGREED(HttpStatus.BAD_REQUEST, "개인정보처리방침에 동의해주세요."),
    SAME_AS_CURRENT_PASSWORD(HttpStatus.BAD_REQUEST, "새 비밀번호가 현재 비밀번호와 동일합니다."),

    // 401 Unauthorized
    AUTHENTICATION_ERROR(HttpStatus.UNAUTHORIZED, "인증에 실패했습니다."),
    INVALID_CURRENT_PASSWORD(HttpStatus.UNAUTHORIZED, "현재 비밀번호가 일치하지 않습니다."),

    // 403 Forbidden - 접근 권한 없음
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),
    ACCOUNT_DISABLED(HttpStatus.FORBIDDEN, "비활성화된 계정입니다."),
    ACCOUNT_LOCKED(HttpStatus.FORBIDDEN, "계정이 일시적으로 잠겨있습니다. 잠시 후 다시 시도해주세요."),
    TERMS_ACCESS_DENIED(HttpStatus.FORBIDDEN, "약관에 동의해야 접근할 수 있습니다."),
    RESOURCE_DELETED(HttpStatus.NOT_FOUND, "삭제된 리소스입니다."),

    // 404 Not Found - 리소스 없음
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 사용자를 찾을 수 없습니다."),
    USER_PROFILE_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 유저 프로필을 찾을 수 없습니다."),

    // 409 Conflict - 중복 충돌
    DUPLICATE_USER_ID(HttpStatus.CONFLICT, "이미 사용 중인 아이디입니다."),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 가입된 이메일입니다."),
    DUPLICATE_NAME(HttpStatus.CONFLICT, "이미 사용 중인 이름입니다."),
    DUPLICATE_CATEGORY_NAME(HttpStatus.CONFLICT, "이미 사용 중인 카테고리 이름입니다."),

    // 429 Too Many Requests
    TOO_MANY_LOGIN_ATTEMPTS(HttpStatus.TOO_MANY_REQUESTS, "로그인 시도가 너무 많습니다. 30분 후 다시 시도해주세요."),

    // JWT 토큰
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않거나 만료된 토큰입니다."),
    REFRESH_TOKEN_NOT_FOUND(HttpStatus.UNAUTHORIZED, "리프레시 토큰이 존재하지 않습니다. 다시 로그인하세요."),

    // 404 Not Found - 게시글
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 게시글을 찾을 수 없습니다."),

    // 403 Forbidden - 게시글
    POST_DELETE_FORBIDDEN(HttpStatus.FORBIDDEN, "본인이 작성한 게시글만 삭제할 수 있습니다."),
    POST_UPDATE_FORBIDDEN(HttpStatus.FORBIDDEN, "본인이 작성한 게시글만 수정할 수 있습니다."),
    // 현재 서비스에서 미사용. 조회 시 비공개 글 존재 여부를 숨기기 위해 POST_NOT_FOUND를 사용한다.
    POST_PRIVATE(HttpStatus.FORBIDDEN, "비공개 게시글입니다."),

    // 404 Not Found - 카테고리
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 카테고리를 찾을 수 없습니다."),

    // 404 Not Found - 댓글
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 댓글을 찾을 수 없습니다."),

    // 403 Forbidden - 댓글
    COMMENT_UPDATE_FORBIDDEN(HttpStatus.FORBIDDEN, "본인이 작성한 댓글만 수정할 수 있습니다."),
    COMMENT_DELETE_FORBIDDEN(HttpStatus.FORBIDDEN, "댓글을 삭제할 권한이 없습니다."),

    // 500
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생하였습니다.");

    private final HttpStatus status;
    private final String message;
}
