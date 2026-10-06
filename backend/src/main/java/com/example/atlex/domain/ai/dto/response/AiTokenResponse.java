package com.example.atlex.domain.ai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiTokenResponse {
    private int remainingTokens;
    private int maxTokens;
}
