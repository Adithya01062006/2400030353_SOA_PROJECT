package com.subtrack.notificationservice;

import com.subtrack.notificationservice.client.SubscriptionClient;
import com.subtrack.notificationservice.client.UserClient;
import com.subtrack.notificationservice.dto.NotificationResponse;
import com.subtrack.notificationservice.dto.SendNotificationRequest;
import com.subtrack.notificationservice.dto.SubscriptionResponse;
import com.subtrack.notificationservice.dto.UserResponse;
import com.subtrack.notificationservice.entity.Notification;
import com.subtrack.notificationservice.enums.NotificationType;
import com.subtrack.notificationservice.repository.NotificationRepository;
import com.subtrack.notificationservice.service.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private SubscriptionClient subscriptionClient;

    @Mock
    private UserClient userClient;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    @Test
    void testProcessSubscriptionExpiryNotifications_ExpiringToday_GeneratesAlert() {
        // Given an active subscription that expires today
        SubscriptionResponse sub = new SubscriptionResponse();
        sub.setId(101L);
        sub.setUserId(1L);
        sub.setStatus("ACTIVE");
        sub.setExpiryDate(LocalDateTime.now().withHour(23).withMinute(59));

        when(subscriptionClient.getAllSubscriptions()).thenReturn(List.of(sub));
        when(notificationRepository.existsByUserIdAndSubscriptionIdAndTypeAndCreatedAtAfter(
                eq(1L), eq(101L), eq(NotificationType.EXPIRY_ALERT), any(LocalDateTime.class)
        )).thenReturn(false);

        // When
        notificationService.processSubscriptionExpiryNotifications();

        // Then
        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());
        Notification saved = captor.getValue();
        assertEquals(1L, saved.getUserId());
        assertEquals(101L, saved.getSubscriptionId());
        assertEquals(NotificationType.EXPIRY_ALERT, saved.getType());
        assertEquals("Your subscription will end today. Please renew your subscription to continue using the service.", saved.getMessage());
        assertFalse(saved.isRead());
    }

    @Test
    void testProcessSubscriptionExpiryNotifications_AlreadyExpired_DoesNotGenerateAlert() {
        // Given an expired subscription
        SubscriptionResponse sub = new SubscriptionResponse();
        sub.setId(102L);
        sub.setUserId(1L);
        sub.setStatus("EXPIRED");
        sub.setExpiryDate(LocalDateTime.now().minusDays(2));

        when(subscriptionClient.getAllSubscriptions()).thenReturn(List.of(sub));

        // When
        notificationService.processSubscriptionExpiryNotifications();

        // Then - should NOT save any notification
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    void testProcessSubscriptionExpiryNotifications_AlreadyNotifiedToday_DoesNotDuplicate() {
        // Given an active subscription ending today, but already notified today
        SubscriptionResponse sub = new SubscriptionResponse();
        sub.setId(103L);
        sub.setUserId(2L);
        sub.setStatus("ACTIVE");
        sub.setExpiryDate(LocalDateTime.now().withHour(18));

        when(subscriptionClient.getAllSubscriptions()).thenReturn(List.of(sub));
        when(notificationRepository.existsByUserIdAndSubscriptionIdAndTypeAndCreatedAtAfter(
                eq(2L), eq(103L), eq(NotificationType.EXPIRY_ALERT), any(LocalDateTime.class)
        )).thenReturn(true);

        // When
        notificationService.processSubscriptionExpiryNotifications();

        // Then - deduplication stops duplicate save
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    void testSendAdminNotification_SpecificUser() {
        SendNotificationRequest req = new SendNotificationRequest();
        req.setSendToAll(false);
        req.setUserId(5L);
        req.setMessage("Your subscription is about to expire. Please renew your subscription to continue enjoying our service.");

        Notification savedEntity = new Notification(5L, null, req.getMessage(), NotificationType.ADMIN_DIRECT);
        savedEntity.setId(1L);

        when(notificationRepository.saveAll(anyList())).thenReturn(List.of(savedEntity));

        List<NotificationResponse> result = notificationService.sendNotification(req);
        assertEquals(1, result.size());
        assertEquals(5L, result.get(0).getUserId());
        assertEquals(NotificationType.ADMIN_DIRECT, result.get(0).getType());
    }

    @Test
    void testSendAdminNotification_BroadcastAll() {
        SendNotificationRequest req = new SendNotificationRequest();
        req.setSendToAll(true);
        req.setMessage("System maintenance at midnight");

        UserResponse u1 = new UserResponse();
        u1.setId(1L);
        UserResponse u2 = new UserResponse();
        u2.setId(2L);

        when(userClient.getAllUsers()).thenReturn(List.of(u1, u2));
        when(notificationRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<NotificationResponse> result = notificationService.sendNotification(req);
        assertEquals(2, result.size());
        assertEquals(NotificationType.ADMIN_BROADCAST, result.get(0).getType());
        assertEquals(NotificationType.ADMIN_BROADCAST, result.get(1).getType());
    }

    @Test
    void testMarkAsRead() {
        Notification n = new Notification(1L, null, "Test alert", NotificationType.EXPIRY_ALERT);
        n.setId(10L);
        n.setRead(false);

        when(notificationRepository.findById(10L)).thenReturn(Optional.of(n));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        NotificationResponse res = notificationService.markAsRead(10L);
        assertTrue(res.isRead());
        assertNotNull(res.getReadAt());
    }
}
