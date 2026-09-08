package com.example.atlex.global.security.jwt;

import com.example.atlex.global.exception.error.ErrorCode;
import com.example.atlex.global.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtProvider jwtProvider;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (!StringUtils.hasText(authHeader)) {
            // Authorization 헤더 없음 → 비로그인으로 통과 (permitAll 엔드포인트는 익명 접근 허용)
            filterChain.doFilter(request, response);
            return;
        }

        if (!authHeader.startsWith("Bearer ")) {
            sendUnauthorized(response);
            return;
        }

        String token = authHeader.substring(7);
        if (!jwtProvider.validateAccessToken(token)) {
            sendUnauthorized(response);
            return;
        }

        Authentication auth;
        try {
            auth = jwtProvider.getAuthentication(token);
        } catch (JwtException | UsernameNotFoundException e) {
            sendUnauthorized(response);
            return;
        }

        UserDetails userDetails = (UserDetails)auth.getPrincipal();
        if (!userDetails.isAccountNonLocked()) {
            sendUnauthorized(response);
            return;
        }

        SecurityContextHolder.getContext().setAuthentication(auth);
        filterChain.doFilter(request, response);
    }

    private void sendUnauthorized(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(
            objectMapper.writeValueAsString(ApiResponse.fail(ErrorCode.INVALID_TOKEN)));
    }
}
