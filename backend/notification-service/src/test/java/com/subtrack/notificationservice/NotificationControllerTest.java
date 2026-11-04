package com.subtrack.notificationservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.subtrack.notificationservice.controller.NotificationController;
import com.subtrack.notificationservice.dto.NotificationResponse;
import com.subtrack.notificationservice.dto.SendNotificationRequest;
import com.subtrack.notificationservice.enums.NotificationType;
import com.subtrack.notificationservice.exception.GlobalExceptionHandler;
import com.subtrack.notificationservice.exception.ResourceNotFoundException;
import com.subtrack.notificationservice.service.NotificationService;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class NotificationControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationController notificationController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(notificationController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("Positive: GET /api/notifications/user/{userId} returns 200 with notifications list")
    void testGetNotificationsByUserId_Returns200() throws Exception {
        NotificationResponse res = new NotificationResponse();
        res.setId(1L);
        res.setUserId(10L);
        res.setSubscriptionId(100L);
        res.setMessage("Renewal alert");
        res.setType(NotificationType.EXPIRY_ALERT);
        res.setRead(false);
        res.setCreatedAt(LocalDateTime.now());

        when(notificationService.getNotificationsByUserId(10L)).thenReturn(List.of(res));

        mockMvc.perform(get("/api/notifications/user/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].message").value("Renewal alert"));
    }

    @Test
    @DisplayName("Positive: GET /api/notifications/unread-count/{userId} returns count")
    void testGetUnreadCount_Returns200() throws Exception {
        when(notificationService.getUnreadCount(10L)).thenReturn(3L);

        mockMvc.perform(get("/api/notifications/unread-count/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(3));
    }

    @Test
    @DisplayName("Positive: PUT /api/notifications/{id}/read marks notification as read")
    void testMarkAsRead_Returns200() throws Exception {
        NotificationResponse res = new NotificationResponse();
        res.setId(1L);
        res.setUserId(10L);
        res.setSubscriptionId(100L);
        res.setMessage("Renewal alert");
        res.setType(NotificationType.EXPIRY_ALERT);
        res.setRead(true);
        res.setCreatedAt(LocalDateTime.now());
        res.setReadAt(LocalDateTime.now());

        when(notificationService.markAsRead(1L)).thenReturn(res);

        mockMvc.perform(put("/api/notifications/1/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.read").value(true));
    }

    @Test
    @DisplayName("Negative: PUT /api/notifications/{id}/read non-existent returns 404")
    void testMarkAsRead_NotFound_Returns404() throws Exception {
        when(notificationService.markAsRead(999L))
                .thenThrow(new ResourceNotFoundException("Notification not found with id: 999"));

        mockMvc.perform(put("/api/notifications/999/read"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    @DisplayName("Positive: POST /api/notifications/admin/send returns 201 Created")
    void testSendAdminNotification_Returns201() throws Exception {
        SendNotificationRequest req = new SendNotificationRequest(10L, false, "Attention needed");
        NotificationResponse res = new NotificationResponse();
        res.setId(1L);
        res.setUserId(10L);
        res.setMessage("Attention needed");
        res.setType(NotificationType.ADMIN_DIRECT);

        when(notificationService.sendNotification(any(SendNotificationRequest.class))).thenReturn(List.of(res));

        mockMvc.perform(post("/api/notifications/admin/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$[0].type").value("ADMIN_DIRECT"));
    }
}
