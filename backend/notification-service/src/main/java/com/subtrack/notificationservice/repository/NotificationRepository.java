package com.subtrack.notificationservice.repository;

import com.subtrack.notificationservice.entity.Notification;
import com.subtrack.notificationservice.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndIsReadFalse(Long userId);

    boolean existsByUserIdAndSubscriptionIdAndTypeAndCreatedAtAfter(
            Long userId,
            Long subscriptionId,
            NotificationType type,
            LocalDateTime after
    );

    List<Notification> findTop50ByOrderByCreatedAtDesc();

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.userId = :userId AND n.isRead = false")
    void markAllAsReadForUser(@Param("userId") Long userId, @Param("readAt") LocalDateTime readAt);
}
