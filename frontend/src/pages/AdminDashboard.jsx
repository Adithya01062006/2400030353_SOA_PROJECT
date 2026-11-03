import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Users,
  CreditCard,
  Layers,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Activity,
  Calendar,
  FileText,
  Shield,
  ArrowRight,
  RefreshCw,
  Bell,
  Sparkles,
  BarChart3
} from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);

  // Selected invoice for receipt preview modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setError(null);
      const [usersRes, subsRes, plansRes, paymentsRes] = await Promise.all([
        api.get('/api/users').catch(() => ({ data: [] })),
        api.get('/api/subscriptions/all').catch(() => ({ data: [] })),
        api.get('/api/plans/all').catch(() => ({ data: [] })),
        api.get('/api/payments/all').catch(() => ({ data: [] }))
      ]);

      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setSubscriptions(Array.isArray(subsRes.data) ? subsRes.data : []);
      setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
      setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
    } catch (err) {
      setError('Failed to fetch administrative dashboard metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAdminData();
  };

  // Compute Metrics
  const totalUsers = users.length;
  const regularUsersCount = users.filter((u) => u.role !== 'ADMIN').length;
  const adminUsersCount = users.filter((u) => u.role === 'ADMIN').length;

  const totalSubscriptions = subscriptions.length;
  const activeSubs = subscriptions.filter((s) => (s.status || '').toUpperCase() === 'ACTIVE').length;
  const expiredSubs = subscriptions.filter((s) => (s.status || '').toUpperCase() === 'EXPIRED').length;
  const cancelledSubs = subscriptions.filter((s) => (s.status || '').toUpperCase() === 'CANCELLED').length;

  const totalPayments = payments.length;
  const successfulPayments = payments.filter((p) => (p.status || '').toUpperCase() === 'SUCCESS');
  const failedPayments = payments.filter((p) => (p.status || '').toUpperCase() === 'FAILED');
  const totalMockRevenue = successfulPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  // Plan usage calculation
  const planUsageMap = {};
  plans.forEach((plan) => {
    planUsageMap[plan.id] = {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      count: 0,
      activeCount: 0
    };
  });

  subscriptions.forEach((sub) => {
    const pId = sub.planId || sub.plan?.id;
    if (pId && planUsageMap[pId]) {
      planUsageMap[pId].count += 1;
      if ((sub.status || '').toUpperCase() === 'ACTIVE') {
        planUsageMap[pId].activeCount += 1;
      }
    }
  });

  const planUsageList = Object.values(planUsageMap).sort((a, b) => b.count - a.count);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
        <RefreshCw className="spin" size={36} style={{ marginBottom: '16px', color: '#38bdf8' }} />
        <p style={{ fontWeight: 600 }}>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '28px 20px' }}>
      
      {/* Top Header & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#c084fc', letterSpacing: '0.05em', marginBottom: '4px' }}>
            <Shield size={16} /> Admin Portal
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
            Admin <span style={{ color: '#38bdf8' }}>Dashboard</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '6px' }}>
            Real-time analytics, user statistics, mock payments, and plan utilization.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-outline-blue"
            style={{ padding: '8px 18px', fontSize: '0.82rem' }}
            title="Refresh All Metrics"
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <Link
            to="/admin/reports"
            className="btn btn-electric"
            style={{ padding: '8px 20px', fontSize: '0.82rem' }}
          >
            <BarChart3 size={15} /> Reports & Analytics
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Primary KPI Grid (4 Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        
        {/* Total Users */}
        <div className="glass-card" style={{ padding: '20px 22px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              Total Users
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {totalUsers}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{regularUsersCount} regular</span> • {adminUsersCount} admin
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="glass-card" style={{ padding: '20px 22px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              Active Subscriptions
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#10b981', lineHeight: 1.1 }}>
            {activeSubs}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Out of <strong style={{ color: 'var(--text-primary)' }}>{totalSubscriptions}</strong> total subscriptions
          </div>
        </div>

        {/* Mock Revenue Volume */}
        <div className="glass-card" style={{ padding: '20px 22px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              Mock Revenue
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.12)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#38bdf8', lineHeight: 1.1 }}>
            ₹{totalMockRevenue.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '8px', fontWeight: 600 }}>
            Simulated mock payments only
          </div>
        </div>

        {/* Total Mock Transactions */}
        <div className="glass-card" style={{ padding: '20px 22px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              Mock Transactions
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.12)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {totalPayments}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            <span style={{ color: '#10b981', fontWeight: 700 }}>{successfulPayments.length} passed</span> •{' '}
            <span style={{ color: '#f43f5e', fontWeight: 700 }}>{failedPayments.length} failed</span>
          </div>
        </div>

      </div>

      {/* Visual Analytics Row: Subscription Health & Gateway Reliability & Quick Nav */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Subscription Status Breakdown Card */}
        <div className="glass-card" style={{ padding: '22px 24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
            <Activity size={18} color="#38bdf8" /> Subscription Health
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
            Distribution across all user subscriptions
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Active */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span> Active
                </span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {activeSubs} ({totalSubscriptions > 0 ? Math.round((activeSubs / totalSubscriptions) * 100) : 0}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: '#10b981',
                    borderRadius: '999px',
                    width: `${totalSubscriptions > 0 ? (activeSubs / totalSubscriptions) * 100 : 0}%`,
                    transition: 'width 0.5s ease'
                  }}
                ></div>
              </div>
            </div>

            {/* Expired */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></span> Expired
                </span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {expiredSubs} ({totalSubscriptions > 0 ? Math.round((expiredSubs / totalSubscriptions) * 100) : 0}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: '#f59e0b',
                    borderRadius: '999px',
                    width: `${totalSubscriptions > 0 ? (expiredSubs / totalSubscriptions) * 100 : 0}%`,
                    transition: 'width 0.5s ease'
                  }}
                ></div>
              </div>
            </div>

            {/* Cancelled */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                <span style={{ color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }}></span> Cancelled
                </span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {cancelledSubs} ({totalSubscriptions > 0 ? Math.round((cancelledSubs / totalSubscriptions) * 100) : 0}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: '#f43f5e',
                    borderRadius: '999px',
                    width: `${totalSubscriptions > 0 ? (cancelledSubs / totalSubscriptions) * 100 : 0}%`,
                    transition: 'width 0.5s ease'
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span>Total Subscriptions Tracked:</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{totalSubscriptions}</strong>
          </div>
        </div>

        {/* Mock Payment Reliability Card */}
        <div className="glass-card" style={{ padding: '22px 24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
              <CreditCard size={18} color="#818cf8" /> Payment Reliability
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              Simulated payment gateway success ratio
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '5px solid #10b981', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {totalPayments > 0 ? Math.round((successfulPayments.length / totalPayments) * 100) : 0}%
                </div>
                <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
                  Success
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800, color: '#10b981', display: 'block' }}>Successful</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>{successfulPayments.length}</span>
            </div>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.25)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800, color: '#f43f5e', display: 'block' }}>Simulated Failed</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>{failedPayments.length}</span>
            </div>
          </div>
        </div>

        {/* Quick Admin Navigation Card */}
        <div className="glass-card" style={{ padding: '22px 24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
              <Sparkles size={18} color="#c084fc" /> Admin Modules
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              Direct access to system administration
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                to="/admin/reports"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'var(--card-inner-bg)',
                  border: '1px solid var(--border-color)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BarChart3 size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Reports & Analytics
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>CSV data exports & activity charts</div>
                  </div>
                </div>
                <ArrowRight size={14} color="#94a3b8" />
              </Link>

              <Link
                to="/admin/plans"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'var(--card-inner-bg)',
                  border: '1px solid var(--border-color)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Manage Plans Catalog
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Create & update subscription tiers</div>
                  </div>
                </div>
                <ArrowRight size={14} color="#94a3b8" />
              </Link>

              <Link
                to="/admin/notifications"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'var(--card-inner-bg)',
                  border: '1px solid var(--border-color)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bell size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Send Notifications
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Dispatch expiry alerts & offers</div>
                  </div>
                </div>
                <ArrowRight size={14} color="#94a3b8" />
              </Link>
            </div>
          </div>

          <div style={{ marginTop: '14px', paddingTop: '10px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Logged in as: <strong style={{ color: '#38bdf8' }}>{user.email}</strong>
          </div>
        </div>

      </div>

      {/* Subscription Plans Usage Table */}
      <div className="glass-card" style={{ padding: '22px 24px', marginBottom: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Layers size={18} color="#38bdf8" /> Subscription Plans & Usage
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Breakdown of how subscribers are adopting each subscription tier
            </p>
          </div>
          <Link
            to="/admin/plans"
            style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            Manage Plans <ArrowRight size={13} />
          </Link>
        </div>

        {planUsageList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            No subscription plans found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan Name</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Subscribers</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Right Now</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Adoption Share</th>
                </tr>
              </thead>
              <tbody>
                {planUsageList.map((plan) => {
                  const sharePercentage = totalSubscriptions > 0 ? Math.round((plan.count / totalSubscriptions) * 100) : 0;
                  return (
                    <tr key={plan.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {plan.name}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#38bdf8' }}>
                        ₹{Number(plan.price || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                        {plan.count}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                          {plan.activeCount} active
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', minWidth: '160px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ flex: 1, height: '7px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                background: '#38bdf8',
                                borderRadius: '999px',
                                width: `${sharePercentage}%`
                              }}
                            ></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', minWidth: '32px' }}>
                            {sharePercentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Mock Transactions Feed */}
      <div className="glass-card" style={{ padding: '22px 24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <CreditCard size={18} color="#10b981" /> Recent Mock Payment Transactions
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Live transaction stream across all users (Mock simulated)
            </p>
          </div>
          <Link
            to="/admin/reports"
            style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            View Full Report <ArrowRight size={13} />
          </Link>
        </div>

        {payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            No mock transactions recorded yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Txn Ref</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 8).map((pay) => {
                  const isSuccess = (pay.status || '').toUpperCase() === 'SUCCESS';
                  return (
                    <tr key={pay.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {pay.paymentDate ? new Date(pay.paymentDate).toLocaleString() : 'N/A'}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        User #{pay.userId}
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#c084fc', fontSize: '0.8rem', fontWeight: 700 }}>
                        {pay.transactionReference}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        ₹{Number(pay.amount || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge ${isSuccess ? 'badge-active' : 'badge-cancelled'}`}>
                          {pay.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        {isSuccess ? (
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice({ paymentId: pay.id, transactionReference: pay.transactionReference })}
                            className="btn btn-outline-blue"
                            style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                            title="View and print mock payment receipt"
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
          </div>
        )}
      </div>

      {/* Invoice Modal Preview */}
      {selectedInvoice && (
        <InvoiceModal
          paymentId={selectedInvoice.paymentId}
          transactionReference={selectedInvoice.transactionReference}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

    </div>
  );
}
