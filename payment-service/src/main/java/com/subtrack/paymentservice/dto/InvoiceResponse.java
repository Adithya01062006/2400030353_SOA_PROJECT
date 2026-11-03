package com.subtrack.paymentservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.subtrack.paymentservice.entity.Invoice;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InvoiceResponse {

    private Long id;
    private String invoiceNumber;
    private Long paymentId;
    private String transactionReference;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long subscriptionId;
    private String planName;
    private BigDecimal amount;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime paymentDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime subscriptionStartDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime subscriptionEndDate;

    private String paymentStatus;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    private String systemNotice = "SubTrack Mock Payment System - Demonstration Receipt";

    public InvoiceResponse() {
    }

    public static InvoiceResponse fromEntity(Invoice invoice) {
        InvoiceResponse res = new InvoiceResponse();
        res.setId(invoice.getId());
        res.setInvoiceNumber(invoice.getInvoiceNumber());
        res.setPaymentId(invoice.getPaymentId());
        res.setTransactionReference(invoice.getTransactionReference());
        res.setUserId(invoice.getUserId());
        res.setUserName(invoice.getUserName());
        res.setUserEmail(invoice.getUserEmail());
        res.setSubscriptionId(invoice.getSubscriptionId());
        res.setPlanName(invoice.getPlanName());
        res.setAmount(invoice.getAmount());
        res.setPaymentDate(invoice.getPaymentDate());
        res.setSubscriptionStartDate(invoice.getSubscriptionStartDate());
        res.setSubscriptionEndDate(invoice.getSubscriptionEndDate());
        res.setPaymentStatus(invoice.getPaymentStatus());
        res.setCreatedAt(invoice.getCreatedAt());
        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public Long getSubscriptionId() {
        return subscriptionId;
    }

    public void setSubscriptionId(Long subscriptionId) {
        this.subscriptionId = subscriptionId;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public LocalDateTime getSubscriptionStartDate() {
        return subscriptionStartDate;
    }

    public void setSubscriptionStartDate(LocalDateTime subscriptionStartDate) {
        this.subscriptionStartDate = subscriptionStartDate;
    }

    public LocalDateTime getSubscriptionEndDate() {
        return subscriptionEndDate;
    }

    public void setSubscriptionEndDate(LocalDateTime subscriptionEndDate) {
        this.subscriptionEndDate = subscriptionEndDate;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getSystemNotice() {
        return systemNotice;
    }

    public void setSystemNotice(String systemNotice) {
        this.systemNotice = systemNotice;
    }
}
