package com.subtrack.notificationservice.controller;

import com.subtrack.notificationservice.dto.NotificationResponse;
import com.subtrack.notificationservice.dto.SendNotificationRequest;
import com.subtrack.notificationservice.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByUserId(@PathVariable("userId") Long userId) {
        List<NotificationResponse> list = notificationService.getNotificationsByUserId(userId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable("userId") Long userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Collections.singletonMap("unreadCount", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable("id") Long id) {
        NotificationResponse updated = notificationService.markAsRead(id);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(@PathVariable("userId") Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Collections.singletonMap("message", "All notifications marked as read"));
    }

    @PostMapping("/admin/send")
    public ResponseEntity<List<NotificationResponse>> sendNotification(@Valid @RequestBody SendNotificationRequest request) {
        List<NotificationResponse> result = notificationService.sendNotification(request);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/admin/recent")
    public ResponseEntity<List<NotificationResponse>> getRecentSentNotifications() {
        return ResponseEntity.ok(notificationService.getRecentSentNotifications());
    }

    @PostMapping("/process-expiry")
    public ResponseEntity<Map<String, String>> triggerExpiryCheck() {
        notificationService.processSubscriptionExpiryNotifications();
        return ResponseEntity.ok(Collections.singletonMap("message", "Expiry check executed successfully"));
    }
}
