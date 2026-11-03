package com.subtrack.notificationservice.dto;

import jakarta.validation.constraints.NotBlank;

public class SendNotificationRequest {

    private Long userId;
    private boolean sendToAll = false;
    private Long subscriptionId;

    @NotBlank(message = "Message content is required")
    private String message = "Your subscription is about to expire. Please renew your subscription to continue enjoying our service.";

    public SendNotificationRequest() {
    }

    public SendNotificationRequest(Long userId, boolean sendToAll, String message) {
        this.userId = userId;
        this.sendToAll = sendToAll;
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public boolean isSendToAll() {
        return sendToAll;
    }

    public void setSendToAll(boolean sendToAll) {
        this.sendToAll = sendToAll;
    }

    public Long getSubscriptionId() {
        return subscriptionId;
    }

    public void setSubscriptionId(Long subscriptionId) {
        this.subscriptionId = subscriptionId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
