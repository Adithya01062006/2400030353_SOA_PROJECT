import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  CreditCard,
  Layers,
  Shield,
  RefreshCw,
  Clock,
  Printer
} from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';

export default function AdminReports() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState(null);

  // Filter timeframe: 'all' | '30days' | '7days' | 'thisMonth'
  const [timeframe, setTimeframe] = useState('all');
  // Tab view: 'overview' | 'payments' | 'invoices'
  const [activeTab, setActiveTab] = useState('overview');

  // Modal invoice
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    fetchReportsData();
  }, [user]);

  const fetchReportsData = async () => {
    try {
      setError(null);
      const [subsRes, paymentsRes, invoicesRes, plansRes] = await Promise.all([
        api.get('/api/subscriptions/all').catch(() => ({ data: [] })),
        api.get('/api/payments/all').catch(() => ({ data: [] })),
        api.get('/api/payments/invoices').catch(() => ({ data: [] })),
        api.get('/api/plans/all').catch(() => ({ data: [] }))
      ]);

      setSubscriptions(Array.isArray(subsRes.data) ? subsRes.data : []);
      setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
      setInvoices(Array.isArray(invoicesRes.data) ? invoicesRes.data : []);
      setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
    } catch (err) {
      setError('Failed to fetch reporting analytics records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReportsData();
  };

  // Filter items by selected timeframe
  const isWithinTimeframe = (dateStr) => {
    if (!dateStr || timeframe === 'all') return true;
    const date = new Date(dateStr);
    const now = new Date();

    if (timeframe === '7days') {
      const past7 = new Date();
      past7.setDate(now.getDate() - 7);
      return date >= past7;
    }
    if (timeframe === '30days') {
      const past30 = new Date();
      past30.setDate(now.getDate() - 30);
      return date >= past30;
    }
    if (timeframe === 'thisMonth') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filteredSubscriptions = subscriptions.filter((s) =>
    isWithinTimeframe(s.startDate || s.createdAt)
  );

  const filteredPayments = payments.filter((p) =>
    isWithinTimeframe(p.paymentDate || p.createdAt)
  );

  const filteredInvoices = invoices.filter((inv) =>
    isWithinTimeframe(inv.paymentDate || inv.createdAt)
  );

  // Compute Metrics on Filtered Data
  const activeSubs = filteredSubscriptions.filter(
    (s) => (s.status || '').toUpperCase() === 'ACTIVE'
  ).length;
  const expiredSubs = filteredSubscriptions.filter(
    (s) => (s.status || '').toUpperCase() === 'EXPIRED'
  ).length;
  const cancelledSubs = filteredSubscriptions.filter(
    (s) => (s.status || '').toUpperCase() === 'CANCELLED'
  ).length;

  const successfulPayments = filteredPayments.filter(
    (p) => (p.status || '').toUpperCase() === 'SUCCESS'
  );
  const failedPayments = filteredPayments.filter(
    (p) => (p.status || '').toUpperCase() === 'FAILED'
  );
  const mockRevenue = successfulPayments.reduce(
    (acc, p) => acc + (Number(p.amount) || 0),
    0
  );
  const successRate =
    filteredPayments.length > 0
      ? Math.round((successfulPayments.length / filteredPayments.length) * 100)
      : 0;

  // Group payments by date for daily chart
  const paymentsByDay = {};
  filteredPayments.forEach((p) => {
    const d = p.paymentDate ? p.paymentDate.split('T')[0] : 'Unknown';
    if (!paymentsByDay[d]) {
      paymentsByDay[d] = { date: d, count: 0, amount: 0, successCount: 0 };
    }
    paymentsByDay[d].count += 1;
    if ((p.status || '').toUpperCase() === 'SUCCESS') {
      paymentsByDay[d].successCount += 1;
      paymentsByDay[d].amount += Number(p.amount) || 0;
    }
  });

  const dailyChartData = Object.values(paymentsByDay)
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .slice(-14);

  const maxDailyAmount = Math.max(...dailyChartData.map((d) => d.amount), 10);

  // Export CSV functions
  const exportSubscriptionsCSV = () => {
    if (filteredSubscriptions.length === 0) {
      alert('No subscription records to export for this timeframe.');
      return;
    }
    const headers = ['Subscription ID', 'User ID', 'Plan Name', 'Status', 'Start Date', 'Expiry Date'];
    const rows = filteredSubscriptions.map((s) => [
      s.id,
      s.userId,
      `"${s.plan?.name || s.planName || 'Standard'}"`,
      s.status,
      s.startDate || '',
      s.expiryDate || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(csvContent, `SubTrack_Subscriptions_Report_${timeframe}.csv`, 'text/csv;charset=utf-8;');
  };

  const exportPaymentsCSV = () => {
    if (filteredPayments.length === 0) {
      alert('No mock payment records to export for this timeframe.');
      return;
    }
    const headers = ['Payment ID', 'User ID', 'Subscription ID', 'Transaction Ref', 'Amount (INR)', 'Status', 'Payment Date', 'Type'];
    const rows = filteredPayments.map((p) => [
      p.id,
      p.userId,
      p.subscriptionId,
      p.transactionReference,
      p.amount,
      p.status,
      p.paymentDate || '',
      'MOCK_SIMULATION'
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(csvContent, `SubTrack_MockPayments_Report_${timeframe}.csv`, 'text/csv;charset=utf-8;');
  };

  const downloadFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
        <RefreshCw className="spin" size={36} style={{ marginBottom: '16px', color: '#38bdf8' }} />
        <p style={{ fontWeight: 600 }}>Loading Reports & Analytics...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '28px 20px' }}>
      
      {/* Top Header & Timeframe Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#c084fc', letterSpacing: '0.05em', marginBottom: '4px' }}>
            <Shield size={16} /> Administrative Intelligence
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
            Reports & <span style={{ color: '#38bdf8' }}>Analytics</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '6px' }}>
            Historical subscription lifecycles, mock payment performance, and CSV audits.
          </p>
        </div>

        {/* Timeframe Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--card-inner-bg)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'all', label: 'All Time' },
              { id: 'thisMonth', label: 'This Month' },
              { id: '30days', label: 'Last 30D' },
              { id: '7days', label: 'Last 7D' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: 'none',
                  background: timeframe === t.id ? '#38bdf8' : 'transparent',
                  color: timeframe === t.id ? '#07090e' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-outline-blue"
            style={{ padding: '8px 14px', borderRadius: '12px' }}
            title="Refresh Data"
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Mock Notice Banner */}
      <div style={{ padding: '12px 18px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.8rem', color: '#f59e0b', lineHeight: 1.5 }}>
          <strong style={{ fontWeight: 800 }}>Mock Analytics Notice:</strong> All metrics, revenue figures, and charts are derived directly from simulated test payments recorded in the SubTrack sandbox.
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* KPI Cards Row (4 Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        
        {/* Mock Revenue */}
        <div className="glass-card" style={{ padding: '20px 22px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Mock Revenue
            </span>
            <TrendingUp size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            ₹{mockRevenue.toFixed(2)}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            From {successfulPayments.length} successful payments
          </p>
        </div>

        {/* Active Subscriptions */}
        <div className="glass-card" style={{ padding: '20px 22px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Active Subscriptions
            </span>
            <CheckCircle size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#10b981', lineHeight: 1.1 }}>
            {activeSubs}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {expiredSubs} expired • {cancelledSubs} cancelled
          </p>
        </div>

        {/* Total Mock Transactions */}
        <div className="glass-card" style={{ padding: '20px 22px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Total Transactions
            </span>
            <CreditCard size={16} color="#818cf8" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {filteredPayments.length}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {successfulPayments.length} passed • {failedPayments.length} failed
          </p>
        </div>

        {/* Gateway Success Rate */}
        <div className="glass-card" style={{ padding: '20px 22px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Success Rate
            </span>
            <Clock size={16} color="#c084fc" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#c084fc', lineHeight: 1.1 }}>
            {successRate}%
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Across all simulated attempts
          </p>
        </div>

      </div>

      {/* Daily Activity Chart & CSV Export Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* SVG Daily Bar Chart */}
        <div className="glass-card" style={{ padding: '22px 24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
            <BarChart3 size={18} color="#38bdf8" /> Daily Mock Transaction Activity
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
            Daily revenue volume over recent transaction dates
          </p>

          {dailyChartData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              No transactions recorded for this timeframe.
            </div>
          ) : (
            <div>
              <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingTop: '20px', borderBottom: '1px solid var(--border-color)' }}>
                {dailyChartData.map((d, idx) => {
                  const heightPercent = Math.max(Math.round((d.amount / maxDailyAmount) * 100), 12);
                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }} title={`Date: ${d.date}\nAmount: ₹${d.amount.toFixed(2)}\nTxns: ${d.count}`}>
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '32px',
                          borderRadius: '6px 6px 0 0',
                          background: 'linear-gradient(180deg, #38bdf8 0%, #6366f1 100%)',
                          height: `${heightPercent}%`,
                          transition: 'height 0.4s ease'
                        }}
                      ></div>
                    </div>
                  );
                })}
              </div>

              {/* Date Labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                {dailyChartData.map((d, idx) => (
                  <span key={idx} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '40px', textAlign: 'center' }}>
                    {d.date.substring(5)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CSV Export Panel */}
        <div className="glass-card" style={{ padding: '22px 24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
              <Download size={18} color="#10b981" /> Export Audit Reports
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              Download filtered data spreadsheets for offline reporting
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="button"
                onClick={exportSubscriptionsCSV}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'var(--card-inner-bg)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers size={17} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Export Subscriptions CSV
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {filteredSubscriptions.length} rows ({timeframe})
                    </div>
                  </div>
                </div>
                <Download size={15} color="#38bdf8" />
              </button>

              <button
                type="button"
                onClick={exportPaymentsCSV}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'var(--card-inner-bg)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={17} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Export Mock Payments CSV
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {filteredPayments.length} records ({timeframe})
                    </div>
                  </div>
                </div>
                <Download size={15} color="#10b981" />
              </button>
            </div>
          </div>

          <div style={{ marginTop: '16px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            All exports are intended for testing and demonstration audits.
          </div>
        </div>

      </div>

      {/* Multi-Tab Data Tables Card */}
      <div className="glass-card" style={{ padding: '22px 24px', borderRadius: '16px' }}>
        
        {/* Tab Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: activeTab === 'overview' ? '1px solid #38bdf8' : '1px solid transparent',
                background: activeTab === 'overview' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: activeTab === 'overview' ? '#38bdf8' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              Subscriptions ({filteredSubscriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              style={{
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: activeTab === 'payments' ? '1px solid #38bdf8' : '1px solid transparent',
                background: activeTab === 'payments' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: activeTab === 'payments' ? '#38bdf8' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              Payments ({filteredPayments.length})
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              style={{
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: activeTab === 'invoices' ? '1px solid #38bdf8' : '1px solid transparent',
                background: activeTab === 'invoices' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: activeTab === 'invoices' ? '#38bdf8' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              Invoices ({filteredInvoices.length})
            </button>
          </div>

          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Filter: <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{timeframe === 'all' ? 'All Time' : timeframe}</strong>
          </span>
        </div>

        {/* Tab 1: Subscriptions Table */}
        {activeTab === 'overview' && (
          <div style={{ marginTop: '16px', overflowX: 'auto' }}>
            {filteredSubscriptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                No subscription records match this timeframe.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Sub ID</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase' }}>User ID</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Plan Name</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Start Date</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Expiry Date</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>#{sub.id}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-primary)' }}>User #{sub.userId}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {sub.plan?.name || sub.planName || 'Standard'}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                        {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                        {sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge ${sub.status === 'ACTIVE' ? 'badge-active' : 'badge-cancelled'}`}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Payments Table */}
        {activeTab === 'payments' && (
          <div style={{ marginTop: '16px', overflowX: 'auto' }}>
            {filteredPayments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                No payment transactions match this timeframe.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase' }}>User ID</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Sub ID</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Txn Ref</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Amount</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'center' }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => {
                    const isSuccess = (p.status || '').toUpperCase() === 'SUCCESS';
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {p.paymentDate ? new Date(p.paymentDate).toLocaleString() : 'N/A'}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-primary)' }}>User #{p.userId}</td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>#{p.subscriptionId}</td>
                        <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#c084fc', fontSize: '0.8rem', fontWeight: 700 }}>
                          {p.transactionReference}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                          ₹{Number(p.amount || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span className={`badge ${isSuccess ? 'badge-active' : 'badge-cancelled'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          {isSuccess ? (
                            <button
                              type="button"
                              onClick={() => setSelectedInvoice({ paymentId: p.id, transactionReference: p.transactionReference })}
                              className="btn btn-outline-blue"
                              style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                            >
                              <FileText size={13} /> Receipt
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: Invoices Table */}
        {activeTab === 'invoices' && (
          <div style={{ marginTop: '16px', overflowX: 'auto' }}>
            {filteredInvoices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                No generated invoices match this timeframe.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Invoice #</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Subscriber</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Plan Name</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Amount</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 800, color: '#38bdf8' }}>
                        {inv.invoiceNumber}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {inv.paymentDate ? new Date(inv.paymentDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-primary)' }}>
                        <div style={{ fontWeight: 700 }}>{inv.userName || `User #${inv.userId}`}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{inv.userEmail || ''}</div>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {inv.planName || 'Standard'}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#10b981' }}>
                        ₹{Number(inv.amount || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className="badge badge-active">
                          {inv.paymentStatus || 'PAID'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="btn btn-electric"
                          style={{ padding: '4px 14px', fontSize: '0.75rem' }}
                        >
                          <Printer size={13} /> View Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>

      {/* Invoice Modal Preview */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice.invoiceNumber ? selectedInvoice : null}
          paymentId={selectedInvoice.paymentId}
          transactionReference={selectedInvoice.transactionReference}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

    </div>
  );
}
