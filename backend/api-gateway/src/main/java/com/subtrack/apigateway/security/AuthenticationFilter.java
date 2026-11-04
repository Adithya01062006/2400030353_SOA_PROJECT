package com.subtrack.apigateway.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class AuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;

    // Public endpoints that do not require authentication
    private static final List<String> OPEN_ENDPOINTS = List.of(
            "/api/users/login",
            "/api/users/register",
            "/api/users/validate",
            "/actuator"
    );

    @Autowired
    public AuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        HttpMethod method = request.getMethod();

        // Allow CORS preflight requests
        if (HttpMethod.OPTIONS.equals(method)) {
            return chain.filter(exchange);
        }

        // Allow root gateway health check
        if ("/".equals(path)) {
            return chain.filter(exchange);
        }

        // Allow open user auth endpoints
        for (String openEndpoint : OPEN_ENDPOINTS) {
            if (path.startsWith(openEndpoint)) {
                return chain.filter(exchange);
            }
        }

        // Allow anonymous users to view available subscription plans
        if (HttpMethod.GET.equals(method) && path.startsWith("/api/plans")) {
            return chain.filter(exchange);
        }

        // Protected Endpoints: Verify JWT Token
        List<String> authHeaders = request.getHeaders().get(HttpHeaders.AUTHORIZATION);
        if (authHeaders == null || authHeaders.isEmpty()) {
            return onError(exchange, HttpStatus.UNAUTHORIZED, "Missing Authorization header", path);
        }

        String authHeader = authHeaders.get(0);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, HttpStatus.UNAUTHORIZED, "Invalid Authorization header format. Expected 'Bearer <token>'", path);
        }

        String token = authHeader.substring(7).trim();
        if (!jwtUtil.validateToken(token)) {
            return onError(exchange, HttpStatus.UNAUTHORIZED, "Invalid or expired JWT token", path);
        }

        // Extract user claims
        Long userId = jwtUtil.extractUserId(token);
        String email = jwtUtil.extractEmail(token);
        String role = jwtUtil.extractRole(token);

        // Role-Based Access Control (RBAC)
        if (path.startsWith("/api/notifications/admin")) {
            if (!"ADMIN".equalsIgnoreCase(role)) {
                return onError(exchange, HttpStatus.FORBIDDEN, "Access denied: ADMIN role required for admin notification operations", path);
            }
        }

        // Admin-only plan management (POST, PUT, DELETE)
        if (path.startsWith("/api/plans") && (HttpMethod.POST.equals(method) || HttpMethod.PUT.equals(method) || HttpMethod.DELETE.equals(method))) {
            if (!"ADMIN".equalsIgnoreCase(role)) {
                return onError(exchange, HttpStatus.FORBIDDEN, "Access denied: ADMIN role required to manage subscription plans", path);
            }
        }

        // Enforce role check for explicit user listings
        if (path.equals("/api/users") && HttpMethod.GET.equals(method)) {
            if (!"ADMIN".equalsIgnoreCase(role)) {
                return onError(exchange, HttpStatus.FORBIDDEN, "Access denied: ADMIN role required to view all registered users", path);
            }
        }

        // Forward authenticated claims to downstream microservices
        ServerHttpRequest.Builder requestBuilder = request.mutate()
                .header("X-User-Id", userId != null ? String.valueOf(userId) : "")
                .header("X-User-Email", email != null ? email : "")
                .header("X-User-Role", role != null ? role : "USER");

        return chain.filter(exchange.mutate().request(requestBuilder.build()).build());
    }

    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus status, String errMessage, String path) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);
        String jsonError = String.format(
                "{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"%s\",\"message\":\"%s\",\"path\":\"%s\"}",
                timestamp,
                status.value(),
                status.getReasonPhrase(),
                errMessage,
                path
        );

        byte[] bytes = jsonError.getBytes(StandardCharsets.UTF_8);
        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -100; // High precedence
    }
}
