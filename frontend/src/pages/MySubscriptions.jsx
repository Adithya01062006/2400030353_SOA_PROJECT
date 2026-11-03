import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { History, CreditCard, RefreshCw, Shield, User, Users, Trash2, FileText } from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';

export default function MySubscriptions() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [viewMode, setViewMode] = useState(isAdmin ? 'all' : 'my'); // 'my' or 'all'
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPaymentInvoice, setSelectedPaymentInvoice] = useState(null);

  const handleDeleteSubscription = async (subId) => {
    if (!window.confirm(`Are you sure you want to permanently delete subscription #${subId}?`)) return;
    try {
      await api.delete(`/api/subscriptions/${subId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete subscription record.');
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, viewMode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (viewMode === 'all' && isAdmin) {
        const [subRes, payRes, usersRes] = await Promise.all([
          api.get('/api/subscriptions/all'),
          api.get('/api/payments/all'),
          api.get('/api/users')
        ]);
        setSubscriptions(subRes.data || []);
        setPayments(payRes.data || []);

        const map = {};
        (usersRes.data || []).forEach(u => {
          map[u.id] = u.name;
        });
        setUserMap(map);
      } else {
        const [subRes, payRes] = await Promise.all([
          api.get(`/api/subscriptions/user/${user.userId}`),
          api.get(`/api/payments/user/${user.userId}`)
        ]);
        setSubscriptions(subRes.data || []);
        setPayments(payRes.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
        <RefreshCw className="spin" size={32} style={{ marginBottom: '16px' }} />
        <p>Loading History Records...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '24px 20px' }}>
      
      {/* Header & View Mode Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            {viewMode === 'all' ? 'All Users Subscriptions & Transactions' : 'My Subscription & Payment History'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
            {viewMode === 'all'
              ? 'Administrator master view showing all subscription plans and payments taken by users.'
              : 'Personal historical record of all your plan activations, renewals, and transactions.'}
          </p>
        </div>

        {isAdmin && (
          <div style={{ display: 'inline-flex', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              onClick={() => setViewMode('all')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'all' ? 'linear-gradient(135deg, #a855f7, #6366f1)' : 'transparent',
                color: viewMode === 'all' ? '#ffffff' : '#94a3b8',
                transition: 'all 0.2s ease'
              }}
            >
              <Users size={15} /> All Users Master View
            </button>
            <button
              onClick={() => setViewMode('my')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'my' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: viewMode === 'my' ? '#38bdf8' : '#94a3b8',
                transition: 'all 0.2s ease'
              }}
            >
              <User size={15} /> My Personal History
            </button>
          </div>
        )}
      </div>

      {/* Box 1: Subscription Lifecycle Events */}
      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <History size={19} color="#38bdf8" />
            {viewMode === 'all' ? 'All User Subscription Plans' : 'My Subscription Lifecycle Events'}
          </h2>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
            {subscriptions.length} {subscriptions.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        {subscriptions.length > 0 ? (
          <div style={{ overflowX: 'auto', maxHeight: '420px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(8px)', zIndex: 1 }}>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID</th>
                  {viewMode === 'all' && (
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c084fc' }}>Username</th>
                  )}
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan Name</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Start Date</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expiry Date</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s ease' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#38bdf8' }}>#{s.id}</td>
                    {viewMode === 'all' && (
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#ffffff' }}>
                        {userMap[s.userId] || `User #${s.userId}`}
                      </td>
                    )}
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#f8fafc' }}>{s.plan?.name}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#f8fafc' }}>₹{s.plan?.price}</td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{new Date(s.startDate).toLocaleDateString()}</td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{new Date(s.expiryDate).toLocaleDateString()}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <StatusBadge status={s.status} />
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      {s.status === 'CANCELLED' ? (
                        <button
                          onClick={() => handleDeleteSubscription(s.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease'
                          }}
                          title="Permanently remove cancelled subscription record"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      ) : (
                        <span style={{ color: '#475569', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8', fontSize: '0.9rem' }}>
            <History size={32} color="#64748b" style={{ margin: '0 auto 10px auto' }} />
            <p>No subscription lifecycle records found.</p>
          </div>
        )}
      </div>

      {/* Box 2: Payment Records */}
      <div className="glass-card" style={{ padding: '20px 24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <CreditCard size={19} color="#a855f7" />
            {viewMode === 'all' ? 'All User Payment Records' : 'My Payment Records'}
          </h2>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
            {payments.length} {payments.length === 1 ? 'Transaction' : 'Transactions'}
          </span>
        </div>

        {payments.length > 0 ? (
          <div style={{ overflowX: 'auto', maxHeight: '420px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(8px)', zIndex: 1 }}>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Txn Reference</th>
                  {viewMode === 'all' && (
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c084fc' }}>Username</th>
                  )}
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timestamp</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.paymentId || p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s ease' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#c084fc', fontWeight: 700 }}>
                      {p.transactionReference}
                    </td>
                    {viewMode === 'all' && (
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#ffffff' }}>
                        {userMap[p.userId] || `User #${p.userId}`}
                      </td>
                    )}
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#f8fafc' }}>
                      ₹{p.amount}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className={`badge ${p.status === 'SUCCESS' ? 'badge-active' : 'badge-cancelled'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8' }}>
                      {new Date(p.paymentDate).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
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
                            gap: '4px',
                            transition: 'all 0.2s ease'
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
          <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8', fontSize: '0.9rem' }}>
            <CreditCard size={32} color="#64748b" style={{ margin: '0 auto 10px auto' }} />
            <p>No payment transaction logs found.</p>
          </div>
        )}
      </div>

      {/* Invoice Modal for Selected Payment */}
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
