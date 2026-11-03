import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Package, Check, CreditCard, Shield, Sparkles, RefreshCw } from 'lucide-react';

export default function Plans() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activatingPlanId, setActivatingPlanId] = useState(null);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/api/plans');
      setPlans(response.data || []);
    } catch (err) {
      setError('Failed to fetch plan catalog from Subscription Service.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (planId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setActivatingPlanId(planId);
    setError(null);

    try {
      const response = await api.post('/api/subscriptions/activate', {
        userId: user.userId,
        planId: planId,
        simulatePaymentFailure: simulateFailure
      });

      alert(`Subscription Activated Successfully!\nStatus: ${response.data.status}\nTxn Ref: ${response.data.lastPayment?.transactionReference}`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Activation failed. Mock payment was rejected.';
      setError(msg);
    } finally {
      setActivatingPlanId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
        <RefreshCw className="spin" size={32} style={{ marginBottom: '16px' }} />
        <p>Loading Subscription Plans...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '0.8rem', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
          SUBSCRIPTION CATALOG
        </span>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '2px', color: '#ffffff' }}>
          Choose Your SubTrack Plan
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', maxWidth: '540px', margin: '4px auto 0 auto' }}>
          Select a flexible plan tailored for your subscription requirements. Process instant mock payments and track recurring billing.
        </p>

        {/* Mock Payment Failure Simulator Toggle */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '14px', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <input
            type="checkbox"
            id="simulateFail"
            checked={simulateFailure}
            onChange={(e) => setSimulateFailure(e.target.checked)}
            style={{ cursor: 'pointer', accentColor: '#ef4444' }}
          />
          <label htmlFor="simulateFail" style={{ fontSize: '0.8rem', color: simulateFailure ? '#fca5a5' : '#94a3b8', cursor: 'pointer' }}>
            Simulate Mock Payment Failure (For QA / Testing)
          </label>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ maxWidth: '600px', margin: '0 auto 20px auto' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'stretch' }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="glass-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '20px',
              borderRadius: '16px',
              position: 'relative'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Package size={20} color="#38bdf8" />
                </div>
                <span className="badge badge-active" style={{ fontSize: '0.72rem', padding: '3px 10px' }}>
                  {plan.durationDays} Days Duration
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px', color: '#ffffff' }}>
                {plan.name}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '12px', minHeight: '36px', lineHeight: '1.4' }}>
                {plan.description}
              </p>

              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '14px', color: '#f8fafc', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                ₹{plan.price} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>/ {plan.durationDays} days</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                  <Check size={14} color="#10b981" style={{ flexShrink: 0 }} /> SubTrack Lifecycle APIs
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                  <Check size={14} color="#10b981" style={{ flexShrink: 0 }} /> OpenFeign Mock Payment
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                  <Check size={14} color="#10b981" style={{ flexShrink: 0 }} /> Automated Expiry Scheduler
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleActivate(plan.id)}
              className="btn btn-electric"
              style={{ width: '100%', padding: '10px 16px', fontSize: '0.85rem', borderRadius: '10px', marginTop: 'auto' }}
              disabled={activatingPlanId === plan.id}
            >
              {activatingPlanId === plan.id ? (
                'Processing Mock Payment...'
              ) : (
                <><CreditCard size={16} /> Activate {plan.name}</>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
