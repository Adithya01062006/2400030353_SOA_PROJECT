package com.subtrack.userservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.subtrack.userservice.controller.UserController;
import com.subtrack.userservice.dto.AuthResponse;
import com.subtrack.userservice.dto.LoginRequest;
import com.subtrack.userservice.dto.RegisterRequest;
import com.subtrack.userservice.dto.UserResponse;
import com.subtrack.userservice.exception.GlobalExceptionHandler;
import com.subtrack.userservice.exception.InvalidCredentialsException;
import com.subtrack.userservice.exception.UserAlreadyExistsException;
import com.subtrack.userservice.security.JwtUtil;
import com.subtrack.userservice.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private UserService userService;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserController userController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("Positive: POST /api/users/register returns 201 Created on valid input")
    void testRegisterUser_Success_Returns201() throws Exception {
        RegisterRequest req = new RegisterRequest("David", "david@example.com", "password123", "USER");
        UserResponse res = new UserResponse(1L, "David", "david@example.com", "USER", LocalDateTime.now());

        when(userService.registerUser(any(RegisterRequest.class))).thenReturn(res);

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("David"))
                .andExpect(jsonPath("$.email").value("david@example.com"));
    }

    @Test
    @DisplayName("Negative: POST /api/users/register with duplicate email returns 409 Conflict")
    void testRegisterUser_DuplicateEmail_Returns409() throws Exception {
        RegisterRequest req = new RegisterRequest("David", "david@example.com", "password123", "USER");

        when(userService.registerUser(any(RegisterRequest.class)))
                .thenThrow(new UserAlreadyExistsException("User with email already exists"));

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Conflict"));
    }

    @Test
    @DisplayName("Negative: POST /api/users/register with invalid email returns 400 Bad Request")
    void testRegisterUser_InvalidEmail_Returns400() throws Exception {
        RegisterRequest req = new RegisterRequest("David", "not-an-email", "password123", "USER");

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    @DisplayName("Positive: POST /api/users/login returns 200 with Auth token")
    void testLoginUser_Success_Returns200() throws Exception {
        LoginRequest req = new LoginRequest("david@example.com", "password123");
        AuthResponse res = new AuthResponse("valid-jwt-token", 1L, "David", "david@example.com", "USER");

        when(userService.loginUser(any(LoginRequest.class))).thenReturn(res);

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("valid-jwt-token"))
                .andExpect(jsonPath("$.email").value("david@example.com"));
    }

    @Test
    @DisplayName("Negative: POST /api/users/login with wrong credentials returns 401 Unauthorized")
    void testLoginUser_InvalidCredentials_Returns401() throws Exception {
        LoginRequest req = new LoginRequest("david@example.com", "wrongPass");

        when(userService.loginUser(any(LoginRequest.class)))
                .thenThrow(new InvalidCredentialsException("Invalid email or password"));

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("Positive: GET /api/users/validate with valid token returns 200")
    void testValidateToken_Valid_Returns200() throws Exception {
        String token = "valid-token";
        when(jwtUtil.validateToken(token)).thenReturn(true);
        when(jwtUtil.extractUserId(token)).thenReturn(1L);
        when(jwtUtil.extractEmail(token)).thenReturn("david@example.com");
        when(jwtUtil.extractRole(token)).thenReturn("USER");

        mockMvc.perform(get("/api/users/validate")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    @DisplayName("Negative: GET /api/users/validate without header returns 401")
    void testValidateToken_MissingHeader_Returns401() throws Exception {
        mockMvc.perform(get("/api/users/validate"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.valid").value(false));
    }
}
