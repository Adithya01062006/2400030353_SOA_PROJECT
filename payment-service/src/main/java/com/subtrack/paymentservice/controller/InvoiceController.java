package com.subtrack.paymentservice.controller;

import com.subtrack.paymentservice.dto.InvoiceResponse;
import com.subtrack.paymentservice.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @Autowired
    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/all")
    public ResponseEntity<List<InvoiceResponse>> getAllInvoicesExplicit() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<InvoiceResponse>> getInvoicesByUserId(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @GetMapping({"/by-payment/{paymentId}", "/payment/{paymentId}"})
    public ResponseEntity<InvoiceResponse> getInvoiceByPaymentId(@PathVariable("paymentId") Long paymentId) {
        return ResponseEntity.ok(invoiceService.getInvoiceByPaymentId(paymentId));
    }

    @GetMapping({"/by-transaction/{transactionReference}", "/transaction/{transactionReference}"})
    public ResponseEntity<InvoiceResponse> getInvoiceByTransactionReference(
            @PathVariable("transactionReference") String transactionReference) {
        return ResponseEntity.ok(invoiceService.getInvoiceByTransactionReference(transactionReference));
    }
}
