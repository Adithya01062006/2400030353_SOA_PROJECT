package com.subtrack.paymentservice.repository;

import com.subtrack.paymentservice.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findByUserIdOrderByPaymentDateDesc(Long userId);

    Optional<Invoice> findByPaymentId(Long paymentId);

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Optional<Invoice> findByTransactionReference(String transactionReference);

    List<Invoice> findAllByOrderByPaymentDateDesc();

    boolean existsByPaymentId(Long paymentId);
}
