package com.subtrack.paymentservice;

import com.subtrack.paymentservice.dto.PaymentRequest;
import com.subtrack.paymentservice.dto.PaymentResponse;
import com.subtrack.paymentservice.entity.Payment;
import com.subtrack.paymentservice.exception.ResourceNotFoundException;
import com.subtrack.paymentservice.repository.PaymentRepository;
import com.subtrack.paymentservice.service.InvoiceService;
import com.subtrack.paymentservice.service.PaymentServiceImpl;
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
public class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private InvoiceService invoiceService;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private Payment samplePayment;

    @BeforeEach
    void setUp() {
        samplePayment = new Payment(1L, 10L, 100L, new BigDecimal("49.99"), "SUCCESS", "TXN-TEST-123", LocalDateTime.now());
    }

    @Test
    @DisplayName("Positive: Process payment with success generates transaction reference and invoice")
    void testProcessPayment_Success() {
        PaymentRequest req = new PaymentRequest(10L, 100L, new BigDecimal("49.99"), false);

        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        PaymentResponse response = paymentService.processPayment(req);

        assertNotNull(response);
        assertEquals(1L, response.getPaymentId());
        assertEquals("SUCCESS", response.getStatus());
        assertTrue(response.getTransactionReference().startsWith("TXN-"));
        assertEquals(new BigDecimal("49.99"), response.getAmount());
        verify(invoiceService, times(1)).createInvoiceForPayment(any(Payment.class), eq(req));
    }

    @Test
    @DisplayName("Negative/Simulation: Process payment with simulateFailure sets status to FAILED")
    void testProcessPayment_SimulatedFailure() {
        PaymentRequest req = new PaymentRequest(10L, 100L, new BigDecimal("49.99"), true);

        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(2L);
            return p;
        });

        PaymentResponse response = paymentService.processPayment(req);

        assertNotNull(response);
        assertEquals(2L, response.getPaymentId());
        assertEquals("FAILED", response.getStatus());
        verify(invoiceService, never()).createInvoiceForPayment(any(), any());
    }

    @Test
    @DisplayName("Positive: Get payment by existing ID returns response")
    void testGetPaymentById_Found() {
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(samplePayment));

        PaymentResponse response = paymentService.getPaymentById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getPaymentId());
        assertEquals("TXN-TEST-123", response.getTransactionReference());
    }

    @Test
    @DisplayName("Negative: Get payment by non-existent ID throws ResourceNotFoundException")
    void testGetPaymentById_NotFound_ThrowsException() {
        when(paymentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> paymentService.getPaymentById(999L));
    }

    @Test
    @DisplayName("Positive: Get payments by user ID returns user payments list")
    void testGetPaymentsByUserId() {
        when(paymentRepository.findByUserId(10L)).thenReturn(List.of(samplePayment));

        List<PaymentResponse> list = paymentService.getPaymentsByUserId(10L);

        assertEquals(1, list.size());
        assertEquals(10L, list.get(0).getUserId());
    }
}
