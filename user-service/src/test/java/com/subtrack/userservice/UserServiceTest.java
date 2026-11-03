package com.subtrack.userservice;

import com.subtrack.userservice.dto.AuthResponse;
import com.subtrack.userservice.dto.LoginRequest;
import com.subtrack.userservice.dto.RegisterRequest;
import com.subtrack.userservice.dto.UserResponse;
import com.subtrack.userservice.entity.User;
import com.subtrack.userservice.exception.InvalidCredentialsException;
import com.subtrack.userservice.exception.ResourceNotFoundException;
import com.subtrack.userservice.exception.UserAlreadyExistsException;
import com.subtrack.userservice.repository.UserRepository;
import com.subtrack.userservice.security.JwtUtil;
import com.subtrack.userservice.service.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserServiceImpl userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User(1L, "Alice Johnson", "alice@example.com", "encodedSecret123", "USER", LocalDateTime.now());
    }

    @Test
    @DisplayName("Positive: Register user with valid data assigns default role and hashes password")
    void testRegisterUser_Success_DefaultRole() {
        RegisterRequest request = new RegisterRequest("Alice Johnson", "alice@example.com", "plainPass123", null);

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("plainPass123")).thenReturn("encodedSecret123");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(1L);
            return u;
        });

        UserResponse response = userService.registerUser(request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Alice Johnson", response.getName());
        assertEquals("alice@example.com", response.getEmail());
        assertEquals("USER", response.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Positive: Register user with explicit ADMIN role")
    void testRegisterUser_Success_AdminRole() {
        RegisterRequest request = new RegisterRequest("Admin User", "admin@subtrack.com", "adminPass", "ADMIN");

        when(userRepository.existsByEmail("admin@subtrack.com")).thenReturn(false);
        when(passwordEncoder.encode("adminPass")).thenReturn("encodedAdminPass");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(2L);
            return u;
        });

        UserResponse response = userService.registerUser(request);

        assertNotNull(response);
        assertEquals(2L, response.getId());
        assertEquals("ADMIN", response.getRole());
    }

    @Test
    @DisplayName("Negative: Register user with duplicate email throws UserAlreadyExistsException")
    void testRegisterUser_DuplicateEmail_ThrowsException() {
        RegisterRequest request = new RegisterRequest("Alice Johnson", "alice@example.com", "plainPass123", null);
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThrows(UserAlreadyExistsException.class, () -> userService.registerUser(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Positive: Login user with valid credentials returns JWT token and details")
    void testLoginUser_Success() {
        LoginRequest request = new LoginRequest("alice@example.com", "plainPass123");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("plainPass123", "encodedSecret123")).thenReturn(true);
        when(jwtUtil.generateToken(1L, "alice@example.com", "USER")).thenReturn("mock-jwt-token");

        AuthResponse response = userService.loginUser(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        assertEquals(1L, response.getUserId());
        assertEquals("alice@example.com", response.getEmail());
        assertEquals("USER", response.getRole());
    }

    @Test
    @DisplayName("Negative: Login user with incorrect password throws InvalidCredentialsException")
    void testLoginUser_WrongPassword_ThrowsException() {
        LoginRequest request = new LoginRequest("alice@example.com", "wrongPass");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongPass", "encodedSecret123")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> userService.loginUser(request));
        verify(jwtUtil, never()).generateToken(any(), any(), any());
    }

    @Test
    @DisplayName("Negative: Login user with non-existent email throws InvalidCredentialsException")
    void testLoginUser_NonExistentEmail_ThrowsException() {
        LoginRequest request = new LoginRequest("unknown@example.com", "secret");

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class, () -> userService.loginUser(request));
    }

    @Test
    @DisplayName("Positive: Get user by existing ID returns response")
    void testGetUserById_Found() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        UserResponse response = userService.getUserById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Alice Johnson", response.getName());
    }

    @Test
    @DisplayName("Negative: Get user by non-existent ID throws ResourceNotFoundException")
    void testGetUserById_NotFound_ThrowsException() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUserById(999L));
    }

    @Test
    @DisplayName("Positive: Get all users returns complete list")
    void testGetAllUsers_ReturnsList() {
        User user2 = new User(2L, "Bob", "bob@example.com", "pass", "USER", LocalDateTime.now());
        when(userRepository.findAll()).thenReturn(List.of(sampleUser, user2));

        List<UserResponse> list = userService.getAllUsers();

        assertEquals(2, list.size());
        assertEquals("Alice Johnson", list.get(0).getName());
        assertEquals("Bob", list.get(1).getName());
    }
}
