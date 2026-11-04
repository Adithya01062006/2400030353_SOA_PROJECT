package com.subtrack.apigateway;

import com.subtrack.apigateway.controller.FallbackController;
import com.subtrack.apigateway.security.AuthenticationFilter;
import com.subtrack.apigateway.security.JwtUtil;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class GatewaySecurityTest {

    private JwtUtil jwtUtil;
    private final String secret = "SubTrackSecretKeyForJWTSecurityAuthenticationSignatureVerification2026SecureKey!";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", secret);
    }

    private String createValidToken(Long userId, String email, String role) {
        Key key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("role", role);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    @Test
    @DisplayName("Positive: Gateway JwtUtil successfully validates valid token and extracts claims")
    void testValidateToken_Success() {
        String token = createValidToken(5L, "admin@subtrack.com", "ADMIN");

        assertTrue(jwtUtil.validateToken(token));
        assertEquals(5L, jwtUtil.extractUserId(token));
        assertEquals("admin@subtrack.com", jwtUtil.extractEmail(token));
        assertEquals("ADMIN", jwtUtil.extractRole(token));
    }

    @Test
    @DisplayName("Negative: Gateway JwtUtil rejects malformed or tampered token")
    void testValidateToken_InvalidToken() {
        assertFalse(jwtUtil.validateToken("invalid.token.structure"));
        assertFalse(jwtUtil.validateToken(""));
        assertFalse(jwtUtil.validateToken(null));
    }

    @Test
    @DisplayName("Positive: FallbackController returns UP status and gateway routes")
    void testFallbackController() {
        FallbackController controller = new FallbackController();
        ResponseEntity<Map<String, Object>> response = controller.rootEndpoint();

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("SubTrack API Gateway", response.getBody().get("service"));
        assertEquals("UP", response.getBody().get("status"));
    }

    @Test
    @DisplayName("Positive: AuthenticationFilter has high precedence order")
    void testAuthenticationFilter_Precedence() {
        AuthenticationFilter filter = new AuthenticationFilter(jwtUtil);
        assertEquals(-100, filter.getOrder());
    }
}
