import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import ExpiryAlert from '../components/ExpiryAlert';
import { CreditCard, Calendar, RefreshCw, XCircle, Package, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Shield, Bell, FileText, BarChart3 } from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';

export default function Dashboard() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPaymentInvoice, setSelectedPaymentInvoice] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [subsRes, payRes, notifRes] = await Promise.all([
        api.get(`/api/subscriptions/user/${user.userId}`),
        api.get(`/api/payments/user/${user.userId}`),
        api.get(`/api/notifications/user/${user.userId}`).catch(() => ({ data: [] }))
      ]);
      setSubscriptions(subsRes.data || []);
      setPayments(payRes.data || []);
      setUnreadNotifications((notifRes.data || []).filter(n => !n.read));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Could not connect to SubTrack services via API Gateway.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const activeSub = subscriptions.find(s => s.status === 'ACTIVE');

  const handleRenew = async (subId) => {
    if (!window.confirm('Are you sure you want to process mock payment to renew this subscription?')) return;
    setActionLoading(true);
    setMessage(null);
    setError(null);
    try {
      const response = await api.put(`/api/subscriptions/${subId}/renew`);
      setMessage(`Subscription renewed successfully! New Expiry Date: ${new Date(response.data.expiryDate).toLocaleDateString()}`);
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to renew subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (subId) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return;
    setActionLoading(true);
    setMessage(null);
    setError(null);
    try {
      await api.put(`/api/subscriptions/${subId}/cancel`);
      setMessage('Subscription cancelled successfully.');
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
        <RefreshCw className="spin" size={36} style={{ marginBottom: '16px', color: '#38bdf8' }} />
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>Loading SubTrack Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '24px 20px' }}>
      
      {/* Top Header & Role Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '22px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff' }}>
            Welcome Back, <span style={{ color: '#38bdf8' }}>{user?.name}</span> 👋
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '4px' }}>
            Manage your subscription lifecycle, recurring billing, and payment records.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ padding: '6px 16px', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700 }}>
            Account Role: {user?.role === 'ADMIN' ? '🛡️ System Administrator' : '👤 Regular User'}
          </span>
          {user?.role === 'ADMIN' && (
            <>
              <Link
                to="/admin/dashboard"
                className="btn btn-outline-blue"
                style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <Shield size={13} /> Admin Dashboard
              </Link>
              <Link
                to="/admin/reports"
                className="btn btn-electric"
                style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <BarChart3 size={13} /> Reports & Analytics
              </Link>
            </>
          )}
        </div>
      </div>

      {message && <div className="alert alert-success" style={{ marginBottom: '24px' }}>{message}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '24px' }}>{error}</div>}

      {/* Unread Notifications Banner */}
      {unreadNotifications.length > 0 && (
        <div
          className="glass-card"
          style={{
            marginBottom: '24px',
            padding: '14px 18px',
            borderRadius: '12px',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.2)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Bell size={16} />
            </div>
            <div>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                {unreadNotifications.length} Unread Notification{unreadNotifications.length > 1 ? 's' : ''}:
              </span>{' '}
              <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                "{unreadNotifications[0].message}"
              </span>
            </div>
          </div>
          <Link
            to="/notifications"
            className="btn btn-outline-blue"
            style={{ padding: '6px 14px', fontSize: '0.78rem' }}
          >
            View Notifications →
          </Link>
        </div>
      )}

      {/* Active Subscription Overview Card */}
      {activeSub ? (
        <div style={{ marginBottom: '32px' }}>
          <ExpiryAlert expiryDate={activeSub.expiryDate} />

          <div className="glass-card" style={{ borderLeft: '4px solid #38bdf8', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Package size={24} color="#38bdf8" />
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                    {activeSub.plan?.name}
                  </h2>
                  <StatusBadge status={activeSub.status} />
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  {activeSub.plan?.description}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
                  ₹{activeSub.plan?.price} <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 400 }}>/ {activeSub.plan?.durationDays} days</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600, marginTop: '2px' }}>
                  Microservices Sub ID: #{activeSub.id}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', padding: '16px', background: 'rgba(3, 7, 18, 0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Activation Date</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px', color: '#f8fafc' }}>
                  {new Date(activeSub.startDate).toLocaleDateString()}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Expiration Date</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px', color: '#38bdf8' }}>
                  {new Date(activeSub.expiryDate).toLocaleDateString()}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Payment Status</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} /> Verified via Gateway
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {activeSub.status === 'ACTIVE' && (
                <>
                  <button
                    onClick={() => handleRenew(activeSub.id)}
                    className="btn btn-electric"
                    disabled={actionLoading}
                    style={{ padding: '10px 22px' }}
                  >
                    <RefreshCw size={16} className={actionLoading ? 'spin' : ''} />
                    <span>Renew Subscription</span>
                  </button>

                  <button
                    onClick={() => handleCancel(activeSub.id)}
                    className="btn btn-outline-blue"
                    disabled={actionLoading}
                    style={{ padding: '10px 22px', borderColor: 'rgba(239, 68, 68, 0.5)', color: '#fca5a5' }}
                  >
                    <XCircle size={16} />
                    <span>Cancel Subscription</span>
                  </button>
                </>
              )}

              <Link to="/plans" className="btn btn-outline-blue" style={{ padding: '10px 22px' }}>
                <Package size={16} /> Change / Upgrade Plan
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '24px 20px',
            marginBottom: '24px',
            borderRadius: '16px',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.6) 100%)'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)'
            }}
          >
            <Package size={22} color="#38bdf8" />
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
            No Active Subscription Found
          </h3>

          <p style={{ color: '#94a3b8', fontSize: '0.86rem', maxWidth: '460px', margin: '4px auto 16px auto', lineHeight: '1.45' }}>
            {user?.role === 'ADMIN'
              ? 'Your administrator account currently has no active subscription. You can activate a plan to test lifecycle tracking or manage plan offerings in the Admin Portal.'
              : 'You do not have an active subscription plan right now. Choose a flexible plan from our catalog to start tracking your lifecycle.'}
          </p>

          <div style={{ display: 'inline-flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/plans" className="btn btn-electric" style={{ padding: '8px 20px', fontSize: '0.82rem' }}>
              Browse Available Plans <ArrowRight size={14} />
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin/plans"
                className="btn"
                style={{
                  padding: '8px 20px',
                  fontSize: '0.82rem',
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(99, 102, 241, 0.25))',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  color: '#c084fc'
                }}
              >
                Open Admin Plan Manager
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Payment History Log */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} color="#38bdf8" /> Recent Payment Transactions
          </h3>
          <Link to="/subscriptions" style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: 700, textDecoration: 'underline' }}>
            View Full History →
          </Link>
        </div>

        {payments.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: '12px' }}>Txn Reference</th>
                  <th style={{ padding: '12px' }}>Amount</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Timestamp</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 5).map(p => (
                  <tr key={p.paymentId || p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>
                      {p.transactionReference}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#ffffff' }}>
                      ₹{p.amount}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${p.status === 'SUCCESS' ? 'badge-active' : 'badge-cancelled'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#94a3b8' }}>
                      {new Date(p.paymentDate).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {p.status === 'SUCCESS' ? (
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentInvoice({ paymentId: p.paymentId || p.id, transactionReference: p.transactionReference })}
                          style={{
                            background: 'rgba(56, 189, 248, 0.15)',
                            border: '1px solid rgba(56, 189, 248, 0.35)',
                            color: '#38bdf8',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="View and print mock payment receipt"
                        >
                          <FileText size={13} /> Receipt
                        </button>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
            No payment transaction logs available yet.
          </p>
        )}
      </div>

      {/* Invoice Modal Preview */}
      {selectedPaymentInvoice && (
        <InvoiceModal
          paymentId={selectedPaymentInvoice.paymentId}
          transactionReference={selectedPaymentInvoice.transactionReference}
          onClose={() => setSelectedPaymentInvoice(null)}
        />
      )}

    </div>
  );
}
