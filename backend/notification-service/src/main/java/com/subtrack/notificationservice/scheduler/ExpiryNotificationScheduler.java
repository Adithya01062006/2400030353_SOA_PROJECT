package com.subtrack.notificationservice.scheduler;

import com.subtrack.notificationservice.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ExpiryNotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(ExpiryNotificationScheduler.class);

    private final NotificationService notificationService;

    @Autowired
    public ExpiryNotificationScheduler(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Scheduled(fixedRateString = "${notification.expiry-check-rate-ms:30000}", initialDelay = 10000)
    public void scheduleExpiryChecks() {
        try {
            notificationService.processSubscriptionExpiryNotifications();
        } catch (Exception e) {
            log.error("Error during scheduled expiry notification execution: {}", e.getMessage());
        }
    }
}
