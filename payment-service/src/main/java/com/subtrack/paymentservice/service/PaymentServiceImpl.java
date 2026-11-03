package com.subtrack.paymentservice.service;

import com.subtrack.paymentservice.dto.PaymentRequest;
import com.subtrack.paymentservice.dto.PaymentResponse;
import com.subtrack.paymentservice.entity.Payment;
import com.subtrack.paymentservice.exception.ResourceNotFoundException;
import com.subtrack.paymentservice.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceService invoiceService;

    @Autowired
    public PaymentServiceImpl(PaymentRepository paymentRepository, InvoiceService invoiceService) {
        this.paymentRepository = paymentRepository;
        this.invoiceService = invoiceService;
    }

    @Override
    public PaymentResponse processPayment(PaymentRequest paymentRequest) {
        String status = paymentRequest.isSimulateFailure() ? "FAILED" : "SUCCESS";
        String txnRef = "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Payment payment = new Payment();
        payment.setUserId(paymentRequest.getUserId());
        payment.setSubscriptionId(paymentRequest.getSubscriptionId());
        payment.setAmount(paymentRequest.getAmount());
        payment.setPaymentStatus(status);
        payment.setTransactionReference(txnRef);
        payment.setPaymentDate(LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS));

        Payment savedPayment = paymentRepository.save(payment);

        // If mock payment succeeded, generate invoice immediately
        if ("SUCCESS".equalsIgnoreCase(savedPayment.getPaymentStatus())) {
            try {
                invoiceService.createInvoiceForPayment(savedPayment, paymentRequest);
            } catch (Exception e) {
                // Log and continue without failing the payment transaction
                org.slf4j.LoggerFactory.getLogger(PaymentServiceImpl.class)
                        .warn("Non-fatal: could not create invoice immediately for payment {}: {}", savedPayment.getId(), e.getMessage());
            }
        }

        return mapToResponse(savedPayment);
    }

    @Override
    public List<PaymentResponse> getPaymentsByUserId(Long userId) {
        return paymentRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PaymentResponse getPaymentById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found with ID: " + paymentId));
        return mapToResponse(payment);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getTransactionReference(),
                payment.getPaymentStatus(),
                payment.getAmount(),
                payment.getUserId(),
                payment.getSubscriptionId(),
                payment.getPaymentDate()
        );
    }
}
