package com.example.atlex.domain.github.entity;

/**
 * 게시글 삭제 시 GitHub 연동 저장소 내 파일 처리 옵션입니다.
 */
public enum DeleteOption {
    /** GitHub 저장소 내의 대응 파일도 함께 삭제합니다. */
    DELETE_FILE,
    /** GitHub 저장소 내의 파일은 삭제하지 않고 그대로 유지합니다. */
    KEEP_FILE
}
