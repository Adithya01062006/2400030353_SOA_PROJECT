package com.subtrack.userservice;

import com.subtrack.userservice.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

public class JwtUtilTest {

    private JwtUtil jwtUtil;
    private final String secret = "SubTrackSecretKeyForJWTSecurityAuthenticationSignatureVerification2026SecureKey!";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", secret);
        ReflectionTestUtils.setField(jwtUtil, "expiration", 3600000L); // 1 hour
    }

    @Test
    @DisplayName("Positive: Generate and validate token successfully")
    void testGenerateAndValidateToken_Success() {
        String token = jwtUtil.generateToken(10L, "test@example.com", "USER");

        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token));
        assertEquals("test@example.com", jwtUtil.extractEmail(token));
        assertEquals(10L, jwtUtil.extractUserId(token));
        assertEquals("USER", jwtUtil.extractRole(token));
    }

    @Test
    @DisplayName("Positive: Generate token with ADMIN role")
    void testGenerateToken_AdminRole() {
        String token = jwtUtil.generateToken(1L, "admin@subtrack.com", "ADMIN");

        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token));
        assertEquals("admin@subtrack.com", jwtUtil.extractEmail(token));
        assertEquals("ADMIN", jwtUtil.extractRole(token));
    }

    @Test
    @DisplayName("Negative: Validate tampered token returns false")
    void testValidateToken_TamperedToken_ReturnsFalse() {
        String token = jwtUtil.generateToken(10L, "test@example.com", "USER");
        String tamperedToken = token + "corrupted";

        assertFalse(jwtUtil.validateToken(tamperedToken));
    }

    @Test
    @DisplayName("Negative: Validate malformed token string returns false")
    void testValidateToken_Malformed_ReturnsFalse() {
        assertFalse(jwtUtil.validateToken("not-a-valid-jwt"));
    }
}
