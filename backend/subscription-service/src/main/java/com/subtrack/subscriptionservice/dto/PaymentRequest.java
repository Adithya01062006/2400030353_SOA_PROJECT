package com.subtrack.subscriptionservice.dto;

import java.math.BigDecimal;

public class PaymentRequest {

    private Long userId;
    private Long subscriptionId;
    private BigDecimal amount;
    private boolean simulateFailure;
    private String planName;
    private java.time.LocalDateTime startDate;
    private java.time.LocalDateTime expiryDate;

    public PaymentRequest() {
    }

    public PaymentRequest(Long userId, Long subscriptionId, BigDecimal amount, boolean simulateFailure) {
        this.userId = userId;
        this.subscriptionId = subscriptionId;
        this.amount = amount;
        this.simulateFailure = simulateFailure;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getSubscriptionId() {
        return subscriptionId;
    }

    public void setSubscriptionId(Long subscriptionId) {
        this.subscriptionId = subscriptionId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public boolean isSimulateFailure() {
        return simulateFailure;
    }

    public void setSimulateFailure(boolean simulateFailure) {
        this.simulateFailure = simulateFailure;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public java.time.LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(java.time.LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public java.time.LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(java.time.LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }
}
