package com.example.atlex.domain.category.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

public class DuplicateCategoryNameException extends CustomException {
    public DuplicateCategoryNameException() {
        super(ErrorCode.DUPLICATE_CATEGORY_NAME);
    }
}
