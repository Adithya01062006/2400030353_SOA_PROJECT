package com.subtrack.notificationservice.service;

import com.subtrack.notificationservice.client.SubscriptionClient;
import com.subtrack.notificationservice.client.UserClient;
import com.subtrack.notificationservice.dto.NotificationResponse;
import com.subtrack.notificationservice.dto.SendNotificationRequest;
import com.subtrack.notificationservice.dto.SubscriptionResponse;
import com.subtrack.notificationservice.dto.UserResponse;
import com.subtrack.notificationservice.entity.Notification;
import com.subtrack.notificationservice.enums.NotificationType;
import com.subtrack.notificationservice.exception.ResourceNotFoundException;
import com.subtrack.notificationservice.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private static final String DEFAULT_EXPIRY_MESSAGE =
            "Your subscription will end today. Please renew your subscription to continue using the service.";

    private static final String DEFAULT_ADMIN_MESSAGE =
            "Your subscription is about to expire. Please renew your subscription to continue enjoying our service.";

    private final NotificationRepository notificationRepository;
    private final SubscriptionClient subscriptionClient;
    private final UserClient userClient;

    @Autowired
    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   SubscriptionClient subscriptionClient,
                                   UserClient userClient) {
        this.notificationRepository = notificationRepository;
        this.subscriptionClient = subscriptionClient;
        this.userClient = userClient;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }
        return NotificationResponse.fromEntity(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadForUser(userId, LocalDateTime.now());
    }

    @Override
    @Transactional
    public List<NotificationResponse> sendNotification(SendNotificationRequest request) {
        String msg = (request.getMessage() != null && !request.getMessage().trim().isEmpty())
                ? request.getMessage().trim()
                : DEFAULT_ADMIN_MESSAGE;

        List<Notification> created = new ArrayList<>();

        if (request.isSendToAll()) {
            try {
                List<UserResponse> users = userClient.getAllUsers();
                if (users != null && !users.isEmpty()) {
                    for (UserResponse u : users) {
                        Notification n = new Notification(
                                u.getId(),
                                null,
                                msg,
                                NotificationType.ADMIN_BROADCAST
                        );
                        created.add(n);
                    }
                }
            } catch (Exception e) {
                log.error("Failed to fetch users from USER-SERVICE for broadcast: {}", e.getMessage());
                throw new RuntimeException("Unable to broadcast: failed to fetch user list from User Service.");
            }
        } else {
            if (request.getUserId() == null) {
                throw new IllegalArgumentException("User ID must be specified when sendToAll is false.");
            }
            Notification n = new Notification(
                    request.getUserId(),
                    request.getSubscriptionId(),
                    msg,
                    NotificationType.ADMIN_DIRECT
            );
            created.add(n);
        }

        List<Notification> saved = notificationRepository.saveAll(created);
        return saved.stream().map(NotificationResponse::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getRecentSentNotifications() {
        return notificationRepository.findTop50ByOrderByCreatedAtDesc()
                .stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void processSubscriptionExpiryNotifications() {
        log.debug("Checking for subscriptions expiring today...");
        try {
            List<SubscriptionResponse> subscriptions = subscriptionClient.getAllSubscriptions();
            if (subscriptions == null || subscriptions.isEmpty()) {
                return;
            }

            LocalDate today = LocalDate.now();
            LocalDateTime startOfToday = today.atStartOfDay();

            for (SubscriptionResponse sub : subscriptions) {
                if (sub.getExpiryDate() == null || sub.getStatus() == null) {
                    continue;
                }

                // Strictly check:
                // 1. Must be ACTIVE (do not notify if already EXPIRED or CANCELLED)
                // 2. Expiry date must match today's date
                boolean isActive = "ACTIVE".equalsIgnoreCase(sub.getStatus());
                boolean expiresToday = sub.getExpiryDate().toLocalDate().isEqual(today);

                if (isActive && expiresToday) {
                    // Check if already notified today for this subscription
                    boolean alreadyNotified = notificationRepository
                            .existsByUserIdAndSubscriptionIdAndTypeAndCreatedAtAfter(
                                    sub.getUserId(),
                                    sub.getId(),
                                    NotificationType.EXPIRY_ALERT,
                                    startOfToday
                            );

                    if (!alreadyNotified) {
                        Notification notification = new Notification(
                                sub.getUserId(),
                                sub.getId(),
                                DEFAULT_EXPIRY_MESSAGE,
                                NotificationType.EXPIRY_ALERT
                        );
                        notificationRepository.save(notification);
                        log.info("Generated expiry notification for user {} subscription {}", sub.getUserId(), sub.getId());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Subscription expiry notification scan skipped or failed: {}", e.getMessage());
        }
    }
}
