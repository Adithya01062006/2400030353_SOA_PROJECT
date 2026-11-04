package com.subtrack.paymentservice;

import com.subtrack.paymentservice.dto.InvoiceResponse;
import com.subtrack.paymentservice.dto.PaymentRequest;
import com.subtrack.paymentservice.entity.Invoice;
import com.subtrack.paymentservice.entity.Payment;
import com.subtrack.paymentservice.exception.ResourceNotFoundException;
import com.subtrack.paymentservice.repository.InvoiceRepository;
import com.subtrack.paymentservice.repository.PaymentRepository;
import com.subtrack.paymentservice.service.InvoiceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private InvoiceServiceImpl invoiceService;

    private Payment samplePayment;
    private Invoice sampleInvoice;

    @BeforeEach
    void setUp() {
        LocalDateTime now = LocalDateTime.now();
        samplePayment = new Payment(1L, 10L, 100L, new BigDecimal("49.99"), "SUCCESS", "TXN-2026-INV1", now);
        sampleInvoice = new Invoice(
                "INV-2026-00001",
                1L,
                "TXN-2026-INV1",
                10L,
                "Alice",
                "alice@example.com",
                100L,
                "Pro Plan",
                new BigDecimal("49.99"),
                now,
                now,
                now.plusDays(30),
                "SUCCESS"
        );
        sampleInvoice.setId(10L);
    }

    @Test
    @DisplayName("Positive: Create invoice for successful payment saves invoice and returns response")
    void testCreateInvoiceForPayment_Success() {
        PaymentRequest req = new PaymentRequest(10L, 100L, new BigDecimal("49.99"), false);
        req.setPlanName("Pro Plan");
        req.setUserName("Alice");

        when(invoiceRepository.findByPaymentId(1L)).thenReturn(Optional.empty());
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> {
            Invoice i = inv.getArgument(0);
            i.setId(10L);
            return i;
        });

        InvoiceResponse response = invoiceService.createInvoiceForPayment(samplePayment, req);

        assertNotNull(response);
        assertEquals(1L, response.getPaymentId());
        assertEquals("Pro Plan", response.getPlanName());
        assertEquals(new BigDecimal("49.99"), response.getAmount());
        verify(invoiceRepository, times(1)).save(any(Invoice.class));
    }

    @Test
    @DisplayName("Negative: Create invoice for non-successful payment returns null")
    void testCreateInvoiceForPayment_NonSuccess_ReturnsNull() {
        samplePayment.setPaymentStatus("FAILED");

        InvoiceResponse res = invoiceService.createInvoiceForPayment(samplePayment, null);

        assertNull(res);
        verify(invoiceRepository, never()).save(any());
    }

    @Test
    @DisplayName("Positive: Get invoice by valid ID returns invoice response")
    void testGetInvoiceById_Found() {
        when(invoiceRepository.findById(10L)).thenReturn(Optional.of(sampleInvoice));

        InvoiceResponse response = invoiceService.getInvoiceById(10L);

        assertNotNull(response);
        assertEquals("INV-2026-00001", response.getInvoiceNumber());
        assertEquals(10L, response.getId());
    }

    @Test
    @DisplayName("Negative: Get invoice by non-existent ID throws ResourceNotFoundException")
    void testGetInvoiceById_NotFound_ThrowsException() {
        when(invoiceRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> invoiceService.getInvoiceById(999L));
    }

    @Test
    @DisplayName("Positive: Get invoice by payment ID returns invoice")
    void testGetInvoiceByPaymentId_Found() {
        when(invoiceRepository.findByPaymentId(1L)).thenReturn(Optional.of(sampleInvoice));

        InvoiceResponse response = invoiceService.getInvoiceByPaymentId(1L);

        assertNotNull(response);
        assertEquals(1L, response.getPaymentId());
    }

    @Test
    @DisplayName("Negative: Get invoice by payment ID where payment does not exist throws ResourceNotFoundException")
    void testGetInvoiceByPaymentId_NotFound_ThrowsException() {
        when(invoiceRepository.findByPaymentId(999L)).thenReturn(Optional.empty());
        when(paymentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> invoiceService.getInvoiceByPaymentId(999L));
    }

    @Test
    @DisplayName("Positive: Get invoice by transaction reference returns invoice")
    void testGetInvoiceByTransactionReference_Found() {
        when(invoiceRepository.findByTransactionReference("TXN-2026-INV1")).thenReturn(Optional.of(sampleInvoice));

        InvoiceResponse res = invoiceService.getInvoiceByTransactionReference("TXN-2026-INV1");

        assertNotNull(res);
        assertEquals("TXN-2026-INV1", res.getTransactionReference());
    }
}
