package com.subtrack.paymentservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.subtrack.paymentservice.controller.PaymentController;
import com.subtrack.paymentservice.dto.PaymentRequest;
import com.subtrack.paymentservice.dto.PaymentResponse;
import com.subtrack.paymentservice.exception.GlobalExceptionHandler;
import com.subtrack.paymentservice.exception.ResourceNotFoundException;
import com.subtrack.paymentservice.service.PaymentService;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class PaymentControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private PaymentController paymentController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(paymentController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("Positive: POST /api/payments/process returns 200 with payment response")
    void testProcessPayment_Success_Returns200() throws Exception {
        PaymentRequest req = new PaymentRequest(1L, 10L, new BigDecimal("29.99"), false);
        PaymentResponse res = new PaymentResponse(1L, "TXN-12345", "SUCCESS", new BigDecimal("29.99"), 1L, 10L, LocalDateTime.now());

        when(paymentService.processPayment(any(PaymentRequest.class))).thenReturn(res);

        mockMvc.perform(post("/api/payments/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.paymentId").value(1))
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.transactionReference").value("TXN-12345"));
    }

    @Test
    @DisplayName("Positive: GET /api/payments/{id} returns 200")
    void testGetPaymentById_Found() throws Exception {
        PaymentResponse res = new PaymentResponse(1L, "TXN-12345", "SUCCESS", new BigDecimal("29.99"), 1L, 10L, LocalDateTime.now());

        when(paymentService.getPaymentById(1L)).thenReturn(res);

        mockMvc.perform(get("/api/payments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentId").value(1))
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }

    @Test
    @DisplayName("Negative: GET /api/payments/{id} not found returns 404")
    void testGetPaymentById_NotFound_Returns404() throws Exception {
        when(paymentService.getPaymentById(999L))
                .thenThrow(new ResourceNotFoundException("Payment not found with ID: 999"));

        mockMvc.perform(get("/api/payments/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }
}
