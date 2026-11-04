package com.subtrack.subscriptionservice;

import com.subtrack.subscriptionservice.client.PaymentClient;
import com.subtrack.subscriptionservice.dto.*;
import com.subtrack.subscriptionservice.entity.Plan;
import com.subtrack.subscriptionservice.entity.Subscription;
import com.subtrack.subscriptionservice.enums.SubscriptionStatus;
import com.subtrack.subscriptionservice.exception.PaymentFailedException;
import com.subtrack.subscriptionservice.exception.ResourceNotFoundException;
import com.subtrack.subscriptionservice.repository.PlanRepository;
import com.subtrack.subscriptionservice.repository.SubscriptionRepository;
import com.subtrack.subscriptionservice.service.SubscriptionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SubscriptionServiceTest {

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private PlanRepository planRepository;

    @Mock
    private PaymentClient paymentClient;

    @InjectMocks
    private SubscriptionServiceImpl subscriptionService;

    private Plan samplePlan;
    private Subscription sampleSubscription;

    @BeforeEach
    void setUp() {
        samplePlan = new Plan(1L, "Enterprise Plan", "Complete suite", new BigDecimal("99.99"), 30, true);
        sampleSubscription = new Subscription(1L, 10L, 1L, LocalDateTime.now(), LocalDateTime.now().plusDays(30), SubscriptionStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now());
    }

    @Test
    @DisplayName("Positive: Activate subscription with successful payment creates ACTIVE subscription")
    void testActivateSubscription_Success() {
        ActivateRequest req = new ActivateRequest(10L, 1L, false);

        when(planRepository.findById(1L)).thenReturn(Optional.of(samplePlan));
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(inv -> {
            Subscription s = inv.getArgument(0);
            s.setId(100L);
            return s;
        });

        PaymentResponse mockPaymentResponse = new PaymentResponse(501L, "TXN-TEST-12345", "SUCCESS", new BigDecimal("99.99"), 10L, 100L, LocalDateTime.now());
        when(paymentClient.processPayment(any(PaymentRequest.class))).thenReturn(mockPaymentResponse);

        SubscriptionResponse response = subscriptionService.activateSubscription(req);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals(SubscriptionStatus.ACTIVE, response.getStatus());
        assertNotNull(response.getLastPayment());
        assertEquals("TXN-TEST-12345", response.getLastPayment().getTransactionReference());
        assertEquals("SUCCESS", response.getLastPayment().getStatus());
        verify(subscriptionRepository, times(1)).save(any(Subscription.class));
    }

    @Test
    @DisplayName("Negative: Activate subscription with non-existent plan throws ResourceNotFoundException")
    void testActivateSubscription_PlanNotFound_ThrowsException() {
        ActivateRequest req = new ActivateRequest(10L, 999L, false);
        when(planRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> subscriptionService.activateSubscription(req));
        verify(paymentClient, never()).processPayment(any());
    }

    @Test
    @DisplayName("Negative: Activate subscription with inactive plan throws IllegalArgumentException")
    void testActivateSubscription_PlanInactive_ThrowsException() {
        samplePlan.setActive(false);
        ActivateRequest req = new ActivateRequest(10L, 1L, false);
        when(planRepository.findById(1L)).thenReturn(Optional.of(samplePlan));

        assertThrows(IllegalArgumentException.class, () -> subscriptionService.activateSubscription(req));
        verify(paymentClient, never()).processPayment(any());
    }

    @Test
    @DisplayName("Negative: Activate subscription when payment fails throws PaymentFailedException and cleans up record")
    void testActivateSubscription_PaymentFailed_ThrowsException() {
        ActivateRequest req = new ActivateRequest(10L, 1L, true);

        when(planRepository.findById(1L)).thenReturn(Optional.of(samplePlan));
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(inv -> {
            Subscription s = inv.getArgument(0);
            s.setId(100L);
            return s;
        });

        PaymentResponse failedPayment = new PaymentResponse(502L, "TXN-FAILED-999", "FAILED", new BigDecimal("99.99"), 10L, 100L, LocalDateTime.now());
        when(paymentClient.processPayment(any(PaymentRequest.class))).thenReturn(failedPayment);

        assertThrows(PaymentFailedException.class, () -> subscriptionService.activateSubscription(req));
        // Verify rollback deletion of the pending subscription
        verify(subscriptionRepository, times(1)).delete(any(Subscription.class));
    }

    @Test
    @DisplayName("Negative: Activate subscription when payment-service feign call fails throws PaymentFailedException")
    void testActivateSubscription_FeignFailure_ThrowsException() {
        ActivateRequest req = new ActivateRequest(10L, 1L, false);

        when(planRepository.findById(1L)).thenReturn(Optional.of(samplePlan));
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(inv -> {
            Subscription s = inv.getArgument(0);
            s.setId(100L);
            return s;
        });
        when(paymentClient.processPayment(any(PaymentRequest.class))).thenThrow(new RuntimeException("Connection refused"));

        assertThrows(PaymentFailedException.class, () -> subscriptionService.activateSubscription(req));
        verify(subscriptionRepository, times(1)).delete(any(Subscription.class));
    }

    @Test
    @DisplayName("Positive: Get subscription by existing ID returns response")
    void testGetSubscriptionById_Found() {
        when(subscriptionRepository.findById(1L)).thenReturn(Optional.of(sampleSubscription));
        when(planRepository.findById(1L)).thenReturn(Optional.of(samplePlan));

        SubscriptionResponse res = subscriptionService.getSubscriptionById(1L);

        assertNotNull(res);
        assertEquals(1L, res.getId());
        assertEquals(SubscriptionStatus.ACTIVE, res.getStatus());
    }

    @Test
    @DisplayName("Negative: Get subscription by non-existent ID throws ResourceNotFoundException")
    void testGetSubscriptionById_NotFound_ThrowsException() {
        when(subscriptionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> subscriptionService.getSubscriptionById(999L));
    }

    @Test
    @DisplayName("Positive: Renew subscription extends expiry date and returns renewed response")
    void testRenewSubscription_Success() {
        when(subscriptionRepository.findById(1L)).thenReturn(Optional.of(sampleSubscription));
        when(planRepository.findById(1L)).thenReturn(Optional.of(samplePlan));
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentResponse mockRenewPayment = new PaymentResponse(601L, "TXN-RENEW-1", "SUCCESS", new BigDecimal("99.99"), 10L, 1L, LocalDateTime.now());
        when(paymentClient.processPayment(any(PaymentRequest.class))).thenReturn(mockRenewPayment);

        SubscriptionResponse renewed = subscriptionService.renewSubscription(1L, null);

        assertNotNull(renewed);
        assertEquals(SubscriptionStatus.ACTIVE, renewed.getStatus());
        assertNotNull(renewed.getLastPayment());
        assertEquals("TXN-RENEW-1", renewed.getLastPayment().getTransactionReference());
    }

    @Test
    @DisplayName("Positive: Cancel subscription marks status CANCELLED")
    void testCancelSubscription_Success() {
        when(subscriptionRepository.findById(1L)).thenReturn(Optional.of(sampleSubscription));
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(inv -> inv.getArgument(0));
        when(planRepository.findById(1L)).thenReturn(Optional.of(samplePlan));

        SubscriptionResponse res = subscriptionService.cancelSubscription(1L);

        assertNotNull(res);
        assertEquals(SubscriptionStatus.CANCELLED, res.getStatus());
    }

    @Test
    @DisplayName("Positive: Scheduler detects and transitions expired subscriptions to EXPIRED")
    void testCheckAndExpireSubscriptions_TransitionsStatus() {
        Subscription expiredSub = new Subscription(2L, 11L, 1L, LocalDateTime.now().minusDays(40), LocalDateTime.now().minusDays(10), SubscriptionStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now());
        when(subscriptionRepository.findByStatusAndExpiryDateBefore(eq(SubscriptionStatus.ACTIVE), any(LocalDateTime.class)))
                .thenReturn(List.of(expiredSub));

        subscriptionService.checkAndExpireSubscriptions();

        assertEquals(SubscriptionStatus.EXPIRED, expiredSub.getStatus());
        verify(subscriptionRepository, times(1)).save(expiredSub);
    }
}
