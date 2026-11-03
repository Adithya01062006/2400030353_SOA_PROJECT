package com.subtrack.notificationservice.client;

import com.subtrack.notificationservice.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "USER-SERVICE")
public interface UserClient {

    @GetMapping("/api/users")
    List<UserResponse> getAllUsers();
}
