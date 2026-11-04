package com.subtrack.subscriptionservice.service;

import com.subtrack.subscriptionservice.client.PaymentClient;
import com.subtrack.subscriptionservice.dto.*;
import com.subtrack.subscriptionservice.entity.Plan;
import com.subtrack.subscriptionservice.entity.Subscription;
import com.subtrack.subscriptionservice.enums.SubscriptionStatus;
import com.subtrack.subscriptionservice.exception.PaymentFailedException;
import com.subtrack.subscriptionservice.exception.ResourceNotFoundException;
import com.subtrack.subscriptionservice.repository.PlanRepository;
import com.subtrack.subscriptionservice.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final PlanRepository planRepository;
    private final PaymentClient paymentClient;

    @Autowired
    public SubscriptionServiceImpl(SubscriptionRepository subscriptionRepository,
                                   PlanRepository planRepository,
                                   PaymentClient paymentClient) {
        this.subscriptionRepository = subscriptionRepository;
        this.planRepository = planRepository;
        this.paymentClient = paymentClient;
    }

    @Override
    @Transactional
    public SubscriptionResponse activateSubscription(ActivateRequest activateRequest) {
        Plan plan = planRepository.findById(activateRequest.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with ID: " + activateRequest.getPlanId()));

        if (!plan.isActive()) {
            throw new IllegalArgumentException("Selected plan is not currently active");
        }

        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        LocalDateTime expiryDate = now.plusDays(plan.getDurationDays());

        // Create pending subscription record
        Subscription subscription = new Subscription();
        subscription.setUserId(activateRequest.getUserId());
        subscription.setPlanId(plan.getId());
        subscription.setStartDate(now);
        subscription.setExpiryDate(expiryDate);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setCreatedAt(now);
        subscription.setUpdatedAt(now);

        Subscription savedSubscription = subscriptionRepository.save(subscription);

        // Process Mock Payment via OpenFeign Client
        PaymentRequest paymentRequest = new PaymentRequest(
                activateRequest.getUserId(),
                savedSubscription.getId(),
                plan.getPrice(),
                activateRequest.isSimulatePaymentFailure()
        );
        paymentRequest.setPlanName(plan.getName());
        paymentRequest.setStartDate(savedSubscription.getStartDate());
        paymentRequest.setExpiryDate(savedSubscription.getExpiryDate());

        PaymentResponse paymentResponse;
        try {
            paymentResponse = paymentClient.processPayment(paymentRequest);
        } catch (Exception e) {
            subscriptionRepository.delete(savedSubscription);
            throw new PaymentFailedException("Payment service unavailable or call failed: " + e.getMessage());
        }

        if (!"SUCCESS".equalsIgnoreCase(paymentResponse.getStatus())) {
            subscriptionRepository.delete(savedSubscription);
            throw new PaymentFailedException("Payment FAILED. Subscription activation aborted. Transaction Ref: " + paymentResponse.getTransactionReference());
        }

        return mapToSubscriptionResponse(savedSubscription, plan, paymentResponse);
    }

    @Override
    public SubscriptionResponse getSubscriptionById(Long id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with ID: " + id));
        Plan plan = planRepository.findById(subscription.getPlanId()).orElse(null);
        return mapToSubscriptionResponse(subscription, plan, null);
    }

    @Override
    public List<SubscriptionResponse> getSubscriptionsByUserId(Long userId) {
        return subscriptionRepository.findByUserId(userId)
                .stream()
                .map(sub -> {
                    Plan plan = planRepository.findById(sub.getPlanId()).orElse(null);
                    return mapToSubscriptionResponse(sub, plan, null);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<SubscriptionResponse> getAllSubscriptions() {
        return subscriptionRepository.findAll()
                .stream()
                .map(sub -> {
                    Plan plan = planRepository.findById(sub.getPlanId()).orElse(null);
                    return mapToSubscriptionResponse(sub, plan, null);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SubscriptionResponse renewSubscription(Long id, RenewRequest renewRequest) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with ID: " + id));

        Plan plan = planRepository.findById(subscription.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found for subscription ID: " + id));

        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        LocalDateTime currentExpiry = subscription.getExpiryDate();
        LocalDateTime newExpiry = (currentExpiry != null && currentExpiry.isAfter(now))
                ? currentExpiry.plusDays(plan.getDurationDays())
                : now.plusDays(plan.getDurationDays());

        PaymentRequest paymentRequest = new PaymentRequest(
                subscription.getUserId(),
                subscription.getId(),
                plan.getPrice(),
                renewRequest != null && renewRequest.isSimulatePaymentFailure()
        );
        paymentRequest.setPlanName(plan.getName());
        paymentRequest.setStartDate(now);
        paymentRequest.setExpiryDate(newExpiry);

        PaymentResponse paymentResponse = paymentClient.processPayment(paymentRequest);

        if (!"SUCCESS".equalsIgnoreCase(paymentResponse.getStatus())) {
            throw new PaymentFailedException("Renewal payment FAILED. Subscription was not renewed.");
        }

        subscription.setExpiryDate(newExpiry);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setUpdatedAt(now);

        Subscription updatedSub = subscriptionRepository.save(subscription);
        return mapToSubscriptionResponse(updatedSub, plan, paymentResponse);
    }

    @Override
    @Transactional
    public SubscriptionResponse cancelSubscription(Long id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with ID: " + id));

        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscription.setUpdatedAt(LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS));

        Subscription savedSub = subscriptionRepository.save(subscription);
        Plan plan = planRepository.findById(savedSub.getPlanId()).orElse(null);
        return mapToSubscriptionResponse(savedSub, plan, null);
    }

    @Override
    @Transactional
    public void deleteSubscription(Long id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with ID: " + id));
        subscriptionRepository.delete(subscription);
    }

    @Override
    @Transactional
    public void checkAndExpireSubscriptions() {
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        List<Subscription> expiredSubs = subscriptionRepository.findByStatusAndExpiryDateBefore(SubscriptionStatus.ACTIVE, now);
        for (Subscription sub : expiredSubs) {
            sub.setStatus(SubscriptionStatus.EXPIRED);
            sub.setUpdatedAt(now);
            subscriptionRepository.save(sub);
        }
    }

    private SubscriptionResponse mapToSubscriptionResponse(Subscription subscription, Plan plan, PaymentResponse paymentResponse) {
        PlanDto planDto = null;
        if (plan != null) {
            planDto = new PlanDto(
                    plan.getId(),
                    plan.getName(),
                    plan.getDescription(),
                    plan.getPrice(),
                    plan.getDurationDays(),
                    plan.isActive()
            );
        }

        return new SubscriptionResponse(
                subscription.getId(),
                subscription.getUserId(),
                planDto,
                subscription.getStartDate(),
                subscription.getExpiryDate(),
                subscription.getStatus(),
                subscription.getCreatedAt(),
                subscription.getUpdatedAt(),
                paymentResponse
        );
    }
}
