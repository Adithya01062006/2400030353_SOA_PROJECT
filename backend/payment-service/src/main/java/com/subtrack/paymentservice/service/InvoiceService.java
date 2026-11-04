package com.subtrack.paymentservice.service;

import com.subtrack.paymentservice.dto.InvoiceResponse;
import com.subtrack.paymentservice.dto.PaymentRequest;
import com.subtrack.paymentservice.entity.Payment;

import java.util.List;

public interface InvoiceService {

    InvoiceResponse createInvoiceForPayment(Payment payment, PaymentRequest request);

    List<InvoiceResponse> getAllInvoices();

    List<InvoiceResponse> getInvoicesByUserId(Long userId);

    InvoiceResponse getInvoiceById(Long id);

    InvoiceResponse getInvoiceByPaymentId(Long paymentId);

    InvoiceResponse getInvoiceByTransactionReference(String transactionReference);

    void syncHistoricalInvoices();
}
