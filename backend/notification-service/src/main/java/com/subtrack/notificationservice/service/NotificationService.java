package com.subtrack.notificationservice.service;

import com.subtrack.notificationservice.dto.NotificationResponse;
import com.subtrack.notificationservice.dto.SendNotificationRequest;

import java.util.List;

public interface NotificationService {

    List<NotificationResponse> getNotificationsByUserId(Long userId);

    long getUnreadCount(Long userId);

    NotificationResponse markAsRead(Long notificationId);

    void markAllAsRead(Long userId);

    List<NotificationResponse> sendNotification(SendNotificationRequest request);

    List<NotificationResponse> getRecentSentNotifications();

    void processSubscriptionExpiryNotifications();
}
