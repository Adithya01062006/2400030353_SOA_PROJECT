package com.subtrack.subscriptionservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.subtrack.subscriptionservice.controller.SubscriptionController;
import com.subtrack.subscriptionservice.dto.ActivateRequest;
import com.subtrack.subscriptionservice.dto.SubscriptionResponse;
import com.subtrack.subscriptionservice.enums.SubscriptionStatus;
import com.subtrack.subscriptionservice.exception.GlobalExceptionHandler;
import com.subtrack.subscriptionservice.exception.PaymentFailedException;
import com.subtrack.subscriptionservice.exception.ResourceNotFoundException;
import com.subtrack.subscriptionservice.service.SubscriptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class SubscriptionControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private SubscriptionService subscriptionService;

    @InjectMocks
    private SubscriptionController subscriptionController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(subscriptionController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("Positive: POST /api/subscriptions/activate returns 201 Created")
    void testActivate_Success_Returns201() throws Exception {
        ActivateRequest req = new ActivateRequest(1L, 10L, false);
        SubscriptionResponse res = new SubscriptionResponse();
        res.setId(100L);
        res.setStatus(SubscriptionStatus.ACTIVE);

        when(subscriptionService.activateSubscription(any(ActivateRequest.class))).thenReturn(res);

        mockMvc.perform(post("/api/subscriptions/activate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("Negative: POST /api/subscriptions/activate when payment fails returns 402 Payment Required")
    void testActivate_PaymentFailed_Returns402() throws Exception {
        ActivateRequest req = new ActivateRequest(1L, 10L, true);

        when(subscriptionService.activateSubscription(any(ActivateRequest.class)))
                .thenThrow(new PaymentFailedException("Payment failed"));

        mockMvc.perform(post("/api/subscriptions/activate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isPaymentRequired())
                .andExpect(jsonPath("$.error").value("Payment Required"));
    }

    @Test
    @DisplayName("Positive: GET /api/subscriptions/{id} returns 200")
    void testGetById_Found_Returns200() throws Exception {
        SubscriptionResponse res = new SubscriptionResponse();
        res.setId(1L);
        res.setStatus(SubscriptionStatus.ACTIVE);

        when(subscriptionService.getSubscriptionById(1L)).thenReturn(res);

        mockMvc.perform(get("/api/subscriptions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("Negative: GET /api/subscriptions/{id} not found returns 404")
    void testGetById_NotFound_Returns404() throws Exception {
        when(subscriptionService.getSubscriptionById(999L))
                .thenThrow(new ResourceNotFoundException("Subscription not found"));

        mockMvc.perform(get("/api/subscriptions/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    @DisplayName("Positive: PUT /api/subscriptions/{id}/cancel returns 200")
    void testCancel_Success_Returns200() throws Exception {
        SubscriptionResponse res = new SubscriptionResponse();
        res.setId(1L);
        res.setStatus(SubscriptionStatus.CANCELLED);

        when(subscriptionService.cancelSubscription(1L)).thenReturn(res);

        mockMvc.perform(put("/api/subscriptions/1/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }
}
