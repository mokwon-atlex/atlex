package com.example.atlex.domain.notification.exception;

import com.example.atlex.global.exception.common.CustomException;
import com.example.atlex.global.exception.error.ErrorCode;

public class NotificationNotFoundException extends CustomException {

    public NotificationNotFoundException() {
        super(ErrorCode.NOTIFICATION_NOT_FOUND);
    }
}
