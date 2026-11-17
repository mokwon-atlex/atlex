package com.example.atlex.domain.file.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

public class FileStorageException extends CustomException {

    public FileStorageException(ErrorCode errorCode) {
        super(errorCode);
    }
}
