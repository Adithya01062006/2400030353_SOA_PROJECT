package com.subtrack.paymentservice.service;

import com.subtrack.paymentservice.dto.InvoiceResponse;
import com.subtrack.paymentservice.dto.PaymentRequest;
import com.subtrack.paymentservice.entity.Invoice;
import com.subtrack.paymentservice.entity.Payment;
import com.subtrack.paymentservice.exception.ResourceNotFoundException;
import com.subtrack.paymentservice.repository.InvoiceRepository;
import com.subtrack.paymentservice.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class InvoiceServiceImpl implements InvoiceService {

    private static final Logger log = LoggerFactory.getLogger(InvoiceServiceImpl.class);

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

    @Autowired
    public InvoiceServiceImpl(InvoiceRepository invoiceRepository, PaymentRepository paymentRepository) {
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
    }

    @Override
    @Transactional
    public InvoiceResponse createInvoiceForPayment(Payment payment, PaymentRequest request) {
        if (!"SUCCESS".equalsIgnoreCase(payment.getPaymentStatus())) {
            log.warn("Cannot create invoice for non-successful payment ID: {}", payment.getId());
            return null;
        }

        // Check if invoice already exists for this payment
        Optional<Invoice> existing = invoiceRepository.findByPaymentId(payment.getId());
        if (existing.isPresent()) {
            return InvoiceResponse.fromEntity(existing.get());
        }

        int year = payment.getPaymentDate() != null ? payment.getPaymentDate().getYear() : LocalDateTime.now().getYear();
        String invoiceNumber = String.format("INV-%d-%05d", year, payment.getId());

        String planName = (request != null && request.getPlanName() != null) ? request.getPlanName() : "SubTrack Subscription";
        String userName = (request != null && request.getUserName() != null) ? request.getUserName() : "Valued Customer";
        String userEmail = (request != null && request.getUserEmail() != null) ? request.getUserEmail() : null;
        LocalDateTime startDate = (request != null && request.getStartDate() != null) ? request.getStartDate() : payment.getPaymentDate();
        LocalDateTime expiryDate = (request != null && request.getExpiryDate() != null) ? request.getExpiryDate() : payment.getPaymentDate().plusDays(30);

        Invoice invoice = new Invoice(
                invoiceNumber,
                payment.getId(),
                payment.getTransactionReference(),
                payment.getUserId(),
                userName,
                userEmail,
                payment.getSubscriptionId(),
                planName,
                payment.getAmount(),
                payment.getPaymentDate(),
                startDate,
                expiryDate,
                payment.getPaymentStatus()
        );

        Invoice saved = invoiceRepository.save(invoice);
        log.info("Generated Invoice #{} for Payment #{}", saved.getInvoiceNumber(), payment.getId());
        return InvoiceResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public List<InvoiceResponse> getAllInvoices() {
        syncHistoricalInvoices();
        return invoiceRepository.findAllByOrderByPaymentDateDesc()
                .stream()
                .map(InvoiceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<InvoiceResponse> getInvoicesByUserId(Long userId) {
        syncHistoricalInvoices();
        return invoiceRepository.findByUserIdOrderByPaymentDateDesc(userId)
                .stream()
                .map(InvoiceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InvoiceResponse getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + id));
        return InvoiceResponse.fromEntity(invoice);
    }

    @Override
    @Transactional
    public InvoiceResponse getInvoiceByPaymentId(Long paymentId) {
        Optional<Invoice> existing = invoiceRepository.findByPaymentId(paymentId);
        if (existing.isPresent()) {
            return InvoiceResponse.fromEntity(existing.get());
        }

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + paymentId));

        if (!"SUCCESS".equalsIgnoreCase(payment.getPaymentStatus())) {
            throw new IllegalArgumentException("Invoices are only generated for successful payments.");
        }

        return createInvoiceForPayment(payment, null);
    }

    @Override
    @Transactional
    public InvoiceResponse getInvoiceByTransactionReference(String transactionReference) {
        Optional<Invoice> existing = invoiceRepository.findByTransactionReference(transactionReference);
        if (existing.isPresent()) {
            return InvoiceResponse.fromEntity(existing.get());
        }

        Payment payment = paymentRepository.findByTransactionReference(transactionReference)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for reference: " + transactionReference));

        return createInvoiceForPayment(payment, null);
    }

    @Override
    @Transactional
    public void syncHistoricalInvoices() {
        try {
            List<Payment> allPayments = paymentRepository.findAll();
            for (Payment p : allPayments) {
                if ("SUCCESS".equalsIgnoreCase(p.getPaymentStatus()) && !invoiceRepository.existsByPaymentId(p.getId())) {
                    createInvoiceForPayment(p, null);
                }
            }
        } catch (Exception e) {
            log.warn("Historical invoice sync encounter notice: {}", e.getMessage());
        }
    }
}
