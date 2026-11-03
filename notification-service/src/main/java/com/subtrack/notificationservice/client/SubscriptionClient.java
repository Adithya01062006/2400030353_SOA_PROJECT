package com.subtrack.notificationservice.client;

import com.subtrack.notificationservice.dto.SubscriptionResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "SUBSCRIPTION-SERVICE")
public interface SubscriptionClient {

    @GetMapping("/api/subscriptions/all")
    List<SubscriptionResponse> getAllSubscriptions();
}
