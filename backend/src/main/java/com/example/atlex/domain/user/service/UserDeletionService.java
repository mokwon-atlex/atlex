package com.example.atlex.domain.user.service;

import com.example.atlex.domain.user.entity.User;
import com.example.atlex.domain.user.event.UserDeactivatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserDeletionService {

    private final UserReader userReader;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void delete(String userId) {
        User user = userReader.getActiveUserByUserId(userId);
        user.deactivate();
        eventPublisher.publishEvent(new UserDeactivatedEvent(user.getId()));
    }
}
