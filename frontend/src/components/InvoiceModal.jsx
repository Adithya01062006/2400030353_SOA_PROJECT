import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  Calendar,
  CreditCard,
  User,
  Hash
} from 'lucide-react';

export default function InvoiceModal({ invoice: initialInvoice, paymentId, transactionReference, onClose }) {
  const [invoice, setInvoice] = useState(initialInvoice || null);
  const [loading, setLoading] = useState(!initialInvoice);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!invoice) {
      fetchInvoice();
    }
  }, [paymentId, transactionReference]);

  const fetchInvoice = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (paymentId) {
        res = await api.get(`/api/payments/invoices/payment/${paymentId}`);
      } else if (transactionReference) {
        res = await api.get(`/api/payments/invoices/transaction/${transactionReference}`);
      }
      if (res && res.data) {
        setInvoice(res.data);
      } else {
        setError('No invoice record found for this transaction.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invoice receipt.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    if (!invoice) return;
    const content = `
========================================================================
                     SUBTRACK SUBSCRIPTION RECEIPT
                  (Mock Simulated Transaction Record)
========================================================================
Invoice Number  : ${invoice.invoiceNumber || 'N/A'}
Date Issued     : ${invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleString() : 'N/A'}
Status          : ${invoice.paymentStatus || 'SUCCESS (PAID)'}
Transaction Ref : ${invoice.transactionReference || 'N/A'}

CUSTOMER INFORMATION:
------------------------------------------------------------------------
Name            : ${invoice.userName || 'Subscriber'}
Email           : ${invoice.userEmail || 'N/A'}
User ID         : ${invoice.userId || 'N/A'}

SUBSCRIPTION DETAILS:
------------------------------------------------------------------------
Plan Name       : ${invoice.planName || 'Standard Subscription'}
Subscription ID : ${invoice.subscriptionId || 'N/A'}
Start Date      : ${invoice.subscriptionStartDate ? new Date(invoice.subscriptionStartDate).toLocaleDateString() : 'N/A'}
End Date        : ${invoice.subscriptionEndDate ? new Date(invoice.subscriptionEndDate).toLocaleDateString() : 'N/A'}

PAYMENT SUMMARY:
------------------------------------------------------------------------
Plan Price      : ₹${Number(invoice.amount || 0).toFixed(2)}
Taxes / Fees    : ₹0.00
------------------------------------------------------------------------
TOTAL PAID      : ₹${Number(invoice.amount || 0).toFixed(2)} (MOCK)
========================================================================
DISCLAIMER: This invoice is generated from SubTrack's mock payment
service for demonstration & educational purposes. No real monetary
funds were transferred.
========================================================================
`;
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Invoice-${invoice.invoiceNumber || 'receipt'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div 
      className="modal-backdrop-print-hide"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="invoice-printable"
        style={{
          background: 'var(--bg-card-solid)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '640px',
          padding: '28px',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          color: 'var(--text-primary)',
          margin: '20px auto'
        }}
      >
        {/* Top Close Button (hidden during print) */}
        <div className="no-print" style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
            <div className="spin" style={{ width: '32px', height: '32px', border: '3px solid rgba(56, 189, 248, 0.2)', borderTop: '3px solid #38bdf8', borderRadius: '50%', margin: '0 auto 12px auto' }}></div>
            <p style={{ fontSize: '0.86rem' }}>Generating receipt...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px 16px' }}>
            <AlertCircle size={40} color="#f43f5e" style={{ margin: '0 auto 12px auto' }} />
            <p style={{ color: '#f43f5e', fontWeight: 700, marginBottom: '8px' }}>Invoice Not Available</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>{error}</p>
            <button
              onClick={onClose}
              className="btn btn-outline-blue"
              style={{ padding: '8px 20px', fontSize: '0.82rem' }}
            >
              Close
            </button>
          </div>
        ) : invoice ? (
          <div>
            {/* Header with SubTrack Branding */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', paddingBottom: '18px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0284c7, #6366f1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1.4rem',
                    color: '#07090e'
                  }}
                >
                  S
                </div>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)' }}>
                    Sub<span style={{ color: '#38bdf8' }}>Track</span>
                  </h2>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, margin: '2px 0 0 0' }}>
                    Subscription Platform Receipt
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-active" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                  <CheckCircle2 size={13} style={{ marginRight: '4px' }} /> PAID (MOCK)
                </span>
                <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
                  {invoice.invoiceNumber || 'INV-PREVIEW'}
                </p>
              </div>
            </div>

            {/* Mock Notice Disclaimer Banner */}
            <div style={{ margin: '16px 0', padding: '12px 14px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <ShieldCheck size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.78rem', color: '#f59e0b', lineHeight: 1.45 }}>
                <strong>Simulated Mock Transaction:</strong> This receipt is generated for demonstration and academic evaluation in SubTrack. No financial charge occurred.
              </div>
            </div>

            {/* Invoice Meta Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', margin: '18px 0', padding: '14px', borderRadius: '12px', background: 'var(--card-inner-bg)', border: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> Issue Date
                </span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginTop: '4px' }}>
                  {invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString() : 'N/A'}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CreditCard size={12} /> Method
                </span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginTop: '4px' }}>
                  Mock Gateway
                </strong>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Hash size={12} /> Transaction Ref
                </span>
                <strong style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#38bdf8', display: 'block', marginTop: '4px', wordBreak: 'break-all' }}>
                  {invoice.transactionReference || 'N/A'}
                </strong>
              </div>
            </div>

            {/* Customer & Subscription Detail */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--card-inner-bg)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#38bdf8', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={13} /> Billed To
                </h4>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {invoice.userName || 'Subscriber'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {invoice.userEmail || `User ID: #${invoice.userId}`}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Customer ID: #{invoice.userId}
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--card-inner-bg)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#38bdf8', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={13} /> Subscription Period
                </h4>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {invoice.planName || 'Subscription Plan'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Start: {invoice.subscriptionStartDate ? new Date(invoice.subscriptionStartDate).toLocaleDateString() : 'N/A'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  End: {invoice.subscriptionEndDate ? new Date(invoice.subscriptionEndDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div style={{ borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead style={{ background: 'var(--table-header-bg)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                  <tr>
                    <th style={{ padding: '10px 14px' }}>Description</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Price</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{invoice.planName || 'Plan Subscription'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Subscription Service Access (Simulated Mock)</div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--text-secondary)' }}>1</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-secondary)' }}>₹{Number(invoice.amount || 0).toFixed(2)}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#38bdf8' }}>₹{Number(invoice.amount || 0).toFixed(2)}</td>
                  </tr>
                </tbody>
                <tfoot style={{ background: 'var(--card-inner-bg)', fontWeight: 700 }}>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td colSpan="3" style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-secondary)' }}>Subtotal</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-primary)' }}>₹{Number(invoice.amount || 0).toFixed(2)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td colSpan="3" style={{ padding: '8px 14px', textAlign: 'right', color: 'var(--text-secondary)' }}>Taxes & Fees</td>
                    <td style={{ padding: '8px 14px', textAlign: 'right', color: 'var(--text-primary)' }}>₹0.00</td>
                  </tr>
                  <tr>
                    <td colSpan="3" style={{ padding: '12px 14px', textAlign: 'right', fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-primary)' }}>Total Mock Paid</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: '1.1rem', fontWeight: 900, color: '#38bdf8' }}>
                      ₹{Number(invoice.amount || 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Bottom Actions (hidden during print) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Simulated transaction receipt
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="btn btn-outline-blue"
                  style={{ padding: '7px 14px', fontSize: '0.78rem' }}
                >
                  <Download size={13} /> Download TXT
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="btn btn-electric"
                  style={{ padding: '7px 18px', fontSize: '0.78rem' }}
                >
                  <Printer size={13} /> Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ padding: '7px 12px', fontSize: '0.78rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
