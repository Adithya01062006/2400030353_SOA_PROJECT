import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  Users,
  User,
  Shield,
  Bell,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Clock,
  Zap,
  Sparkles,
  AlertTriangle,
  Gift,
  Edit3
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const NOTIFICATION_TEMPLATES = [
  {
    id: 'expiry_today',
    title: 'Subscription Expiry (Ends Today)',
    badge: 'EXPIRY ALERT',
    badgeColor: '#ef4444',
    badgeBg: 'rgba(239, 68, 68, 0.15)',
    icon: AlertTriangle,
    message: 'Your subscription will end today. Please renew your subscription to continue using the service.',
    btnLabel: 'Send Expiry Alert',
    btnClass: 'btn-electric',
    btnIcon: AlertTriangle,
    description: 'Alert user that their subscription will conclude by midnight today.'
  },
  {
    id: 'renewal_reminder',
    title: 'Upcoming Expiration Reminder',
    badge: 'RENEWAL REMINDER',
    badgeColor: '#0284c7',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    icon: Clock,
    message: 'Your subscription is about to expire. Please renew your subscription to continue enjoying our service.',
    btnLabel: 'Send Renewal Reminder',
    btnClass: 'btn-outline-blue',
    btnIcon: Clock,
    description: 'Standard prompt encouraging renewal before access is interrupted.'
  },
  {
    id: 'special_offer',
    title: 'Special Renewal Bonus Offer',
    badge: 'EXCLUSIVE OFFER',
    badgeColor: '#a855f7',
    badgeBg: 'rgba(168, 85, 247, 0.15)',
    icon: Gift,
    message: 'Special discount: Renew your subscription today and receive bonus validity on premium plans!',
    btnLabel: 'Send Special Offer',
    btnClass: 'btn-electric',
    btnIcon: Gift,
    description: 'Promotional incentive offering bonus days for immediate renewal.'
  },
  {
    id: 'service_update',
    title: 'Platform Maintenance & Upgrade',
    badge: 'SERVICE NOTICE',
    badgeColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    icon: Sparkles,
    message: 'System upgrade complete: Enjoy high-speed subscription tracking and enhanced payment security.',
    btnLabel: 'Send System Notice',
    btnClass: 'btn-outline-blue',
    btnIcon: Bell,
    description: 'System-wide announcement regarding platform updates and security.'
  }
];

export default function AdminNotifications() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [targetType, setTargetType] = useState('SPECIFIC'); // 'SPECIFIC' or 'ALL'
  const [selectedUserId, setSelectedUserId] = useState('');
  const [customMessage, setCustomMessage] = useState(
    'Your subscription is about to expire. Please renew your subscription to continue enjoying our service.'
  );
  const [sendingId, setSendingId] = useState(null); // template ID or 'custom'
  const [checkingExpiry, setCheckingExpiry] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [recentSent, setRecentSent] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRecentSent();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users');
      setUsers(res.data || []);
      if (res.data && res.data.length > 0 && !selectedUserId) {
        setSelectedUserId(res.data[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load user list for admin:', err);
    }
  };

  const fetchRecentSent = async () => {
    setLoadingRecent(true);
    try {
      const res = await api.get('/api/notifications/admin/recent');
      setRecentSent(res.data || []);
    } catch (err) {
      console.error('Failed to load recent notifications:', err);
    } finally {
      setLoadingRecent(false);
    }
  };

  // 1-Click dispatch for any message button clicked
  const handleSendMessage = async (msgText, triggerId) => {
    if (!msgText || !msgText.trim()) {
      setErrorMessage('Please provide a message to send.');
      return;
    }

    if (targetType === 'SPECIFIC' && !selectedUserId) {
      setErrorMessage('Please select a recipient user from the dropdown.');
      return;
    }

    setSendingId(triggerId);
    setSuccessMessage(null);
    setErrorMessage(null);

    const payload = {
      sendToAll: targetType === 'ALL',
      userId: targetType === 'SPECIFIC' ? parseInt(selectedUserId) : null,
      message: msgText.trim()
    };

    try {
      const res = await api.post('/api/notifications/admin/send', payload);
      const count = Array.isArray(res.data) ? res.data.length : 1;
      const targetLabel =
        targetType === 'ALL'
          ? `All ${count} Registered Users (Broadcast)`
          : `User #${selectedUserId}`;

      setSuccessMessage(`✓ Notification dispatched successfully to ${targetLabel}!`);
      fetchRecentSent();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to dispatch notification.');
    } finally {
      setSendingId(null);
    }
  };

  const handleTriggerExpiryScan = async () => {
    setCheckingExpiry(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await api.post('/api/notifications/process-expiry');
      setSuccessMessage('✓ Automated expiry check completed! Subscriptions ending today have been notified.');
      fetchRecentSent();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to trigger expiry scan.');
    } finally {
      setCheckingExpiry(false);
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '32px 20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#a855f7',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Shield size={14} /> Admin Dispatcher
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            User Notifications & Messaging
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px', margin: 0 }}>
            Choose a notification message button to send directly to users with 1 click, or broadcast to everyone.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleTriggerExpiryScan}
            disabled={checkingExpiry}
            className="btn btn-outline-blue"
            style={{ padding: '9px 18px', fontSize: '0.84rem' }}
            title="Scan subscriptions ending today and dispatch automated notifications"
          >
            <Zap size={15} className={checkingExpiry ? 'spin' : ''} />
            <span>{checkingExpiry ? 'Scanning...' : 'Trigger Auto Expiry Scan'}</span>
          </button>
        </div>
      </div>

      {/* Status Alerts */}
      {successMessage && (
        <div className="alert alert-success" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span style={{ fontWeight: 600 }}>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Select Recipient Card */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          borderRadius: '16px',
          marginBottom: '28px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-card)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.15)',
              color: 'var(--accent-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800
            }}
          >
            1
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Select Recipient Audience
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Choose whether to target an individual user or send a broadcast announcement
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          {/* Specific User Toggle */}
          <button
            type="button"
            onClick={() => setTargetType('SPECIFIC')}
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              border: targetType === 'SPECIFIC' ? '2px solid #0284c7' : '1px solid var(--border-color)',
              background: targetType === 'SPECIFIC' ? 'rgba(2, 132, 199, 0.12)' : 'var(--bg-card-solid)',
              color: targetType === 'SPECIFIC' ? '#0284c7' : 'var(--text-primary)',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: targetType === 'SPECIFIC' ? '0 0 15px rgba(2, 132, 199, 0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <User size={16} /> Send to Specific User
          </button>

          {/* All Users Toggle */}
          <button
            type="button"
            onClick={() => setTargetType('ALL')}
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              border: targetType === 'ALL' ? '2px solid #a855f7' : '1px solid var(--border-color)',
              background: targetType === 'ALL' ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-card-solid)',
              color: targetType === 'ALL' ? '#a855f7' : 'var(--text-primary)',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: targetType === 'ALL' ? '0 0 15px rgba(168, 85, 247, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Users size={16} /> Broadcast to All Users
          </button>
        </div>

        {/* User Selector Dropdown (When Specific User is chosen) */}
        {targetType === 'SPECIFIC' && (
          <div style={{ marginTop: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Select User from Registered Accounts ({users.length} available)
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="auth-select input-field"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'var(--bg-input, #ffffff)',
                color: 'var(--text-primary, #0f172a)',
                border: '1px solid var(--border-color)',
                fontSize: '0.92rem',
                fontWeight: 600,
                outline: 'none',
                boxShadow: 'var(--card-shadow)'
              }}
            >
              {users.length === 0 ? (
                <option value="">No registered users found</option>
              ) : (
                users.map((u) => (
                  <option key={u.id} value={u.id}>
                    User #{u.id} — {u.name || 'User'} ({u.email}) [{u.role}]
                  </option>
                ))
              )}
            </select>
          </div>
        )}
      </div>

      {/* Step 2: Choose Notification Message & Click Button to Send */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.15)',
              color: 'var(--accent-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800
            }}
          >
            2
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Choose Notification Message & Click to Send
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              Click any notification button below to immediately dispatch that notification to the selected recipient:
            </p>
          </div>
        </div>
      </div>

      {/* Message Options Grid: Each with its OWN DISTINCT SEND BUTTON */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        {NOTIFICATION_TEMPLATES.map((tmpl) => {
          const Icon = tmpl.icon;
          const isThisSending = sendingId === tmpl.id;

          return (
            <div
              key={tmpl.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)'
              }}
            >
              <div>
                {/* Header & Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: tmpl.badgeBg,
                        color: tmpl.badgeColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <span style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {tmpl.title}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: tmpl.badgeBg,
                      color: tmpl.badgeColor,
                      letterSpacing: '0.04em'
                    }}
                  >
                    {tmpl.badge}
                  </span>
                </div>

                {/* Subtitle / Description */}
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
                  {tmpl.description}
                </p>

                {/* Message Preview Box */}
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: 'var(--card-inner-bg, #f8fafc)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    marginBottom: '18px',
                    fontStyle: 'normal'
                  }}
                >
                  "{tmpl.message}"
                </div>
              </div>

              {/* Action Buttons: 1-Click Send Button & Edit Button */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  type="button"
                  disabled={sendingId !== null}
                  onClick={() => handleSendMessage(tmpl.message, tmpl.id)}
                  className={`btn ${tmpl.btnClass}`}
                  style={{
                    flex: 1,
                    padding: '11px 18px',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    gap: '8px'
                  }}
                >
                  {isThisSending ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>{tmpl.btnLabel}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomMessage(tmpl.message);
                    window.scrollTo({ top: 600, behavior: 'smooth' });
                  }}
                  title="Copy to custom editor to customize before sending"
                  style={{
                    padding: '11px 14px',
                    borderRadius: '9999px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--card-inner-bg)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  <Edit3 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Option 4: Custom Message Composer */}
      <div
        className="glass-card"
        style={{
          padding: '28px',
          borderRadius: '16px',
          marginBottom: '36px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-card)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#a855f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Edit3 size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Write & Send Custom Notification
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Type any announcement or custom note to send directly
              </p>
            </div>
          </div>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {customMessage.length} characters
          </span>
        </div>

        <textarea
          rows={3}
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Type your custom notification message here..."
          className="auth-input input-field"
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'var(--bg-input, #ffffff)',
            color: 'var(--text-primary, #0f172a)',
            border: '1px solid var(--border-color)',
            fontSize: '0.92rem',
            lineHeight: 1.5,
            resize: 'vertical',
            marginBottom: '16px',
            outline: 'none'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            disabled={sendingId !== null || !customMessage.trim()}
            onClick={() => handleSendMessage(customMessage, 'custom')}
            className="btn btn-electric"
            style={{
              padding: '12px 28px',
              fontSize: '0.9rem',
              fontWeight: 800,
              gap: '8px'
            }}
          >
            {sendingId === 'custom' ? (
              <>
                <RefreshCw size={16} className="spin" />
                <span>Sending Custom Notification...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Send Custom Notification</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sent Notifications Log */}
      <div
        className="glass-card"
        style={{
          padding: '28px',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-card)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Recent Notification Log
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Live audit of notifications generated automatically or dispatched by administrators
            </p>
          </div>
          <button
            onClick={fetchRecentSent}
            className="btn btn-outline-blue"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} className={loadingRecent ? 'spin' : ''} />
            <span>Refresh Log</span>
          </button>
        </div>

        {recentSent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-secondary)' }}>
            <Clock size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: '0.88rem' }}>No notifications sent yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>ID</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Recipient</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Type</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Message</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Sent At</th>
                </tr>
              </thead>
              <tbody>
                {recentSent.map((n) => (
                  <tr key={n.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--accent-blue)' }}>#{n.id}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      User ID #{n.userId}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background:
                            n.type === 'EXPIRY_ALERT'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : n.type === 'ADMIN_BROADCAST'
                              ? 'rgba(168, 85, 247, 0.15)'
                              : 'rgba(2, 132, 199, 0.15)',
                          color:
                            n.type === 'EXPIRY_ALERT'
                              ? '#ef4444'
                              : n.type === 'ADMIN_BROADCAST'
                              ? '#a855f7'
                              : '#0284c7'
                        }}
                      >
                        {n.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-primary)', maxWidth: '360px', lineHeight: 1.4 }}>
                      {n.message}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: n.read ? '#10b981' : '#f59e0b'
                        }}
                      >
                        {n.read ? '✓ Read' : '● Unread'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                      {formatTimestamp(n.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
