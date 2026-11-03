import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Check, Clock, AlertTriangle, MessageSquare, ArrowLeft, RefreshCw, ExternalLink } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' or 'UNREAD'
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/notifications/user/${user.userId}`);
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Could not connect to the Notification Service via API Gateway.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.userId) return;
    try {
      await api.put(`/api/notifications/user/${user.userId}/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setMessage('All notifications marked as read.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filter === 'UNREAD'
    ? notifications.filter(n => !n.read)
    : notifications;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
        <RefreshCw className="spin" size={36} style={{ marginBottom: '16px', color: '#38bdf8' }} />
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>Loading Notifications...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <Link
            to="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#38bdf8',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              marginBottom: '8px'
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}
              >
                {unreadCount} unread
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px', margin: 0 }}>
            Stay updated with your subscription lifecycle alerts and system announcements.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={fetchNotifications}
            className="btn btn-outline-blue"
            style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            title="Refresh"
          >
            <RefreshCw size={15} /> Refresh
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="btn btn-electric"
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            >
              <CheckCheck size={16} /> Mark All as Read
            </button>
          )}
        </div>
      </div>

      {message && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{message}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setFilter('ALL')}
          style={{
            padding: '6px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: filter === 'ALL' ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
            color: filter === 'ALL' ? '#38bdf8' : 'var(--text-secondary)',
            transition: 'all 0.2s ease'
          }}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          style={{
            padding: '6px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: filter === 'UNREAD' ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
            color: filter === 'UNREAD' ? '#38bdf8' : 'var(--text-secondary)',
            transition: 'all 0.2s ease'
          }}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      {filteredNotifications.length === 0 ? (
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)'
          }}
        >
          <Bell size={40} style={{ margin: '0 auto 12px', opacity: 0.3, color: '#38bdf8' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            {filter === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            {filter === 'UNREAD'
              ? 'Great job! You have read all your notifications.'
              : 'You will receive notifications here when your subscription is expiring or when admin messages arrive.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredNotifications.map((n) => {
            const isExpiry = n.type === 'EXPIRY_ALERT';
            return (
              <div
                key={n.id}
                className="glass-card"
                style={{
                  padding: '18px 20px',
                  borderRadius: '12px',
                  border: n.read ? '1px solid var(--border-color)' : '1px solid rgba(56, 189, 248, 0.4)',
                  background: n.read ? 'var(--card-bg)' : 'rgba(56, 189, 248, 0.05)',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Type Icon */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: isExpiry ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                    color: isExpiry ? '#f87171' : '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  {isExpiry ? <AlertTriangle size={20} /> : <MessageSquare size={20} />}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: isExpiry ? '#f87171' : '#38bdf8',
                          background: isExpiry ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {isExpiry ? 'Expiry Alert' : n.type === 'ADMIN_BROADCAST' ? 'Broadcast Announcement' : 'Admin Message'}
                      </span>
                      {!n.read && (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} />
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                      <Clock size={13} />
                      <span>{formatTimestamp(n.createdAt)}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', margin: '6px 0 12px', lineHeight: 1.5, fontWeight: n.read ? 400 : 600 }}>
                    {n.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {!n.read ? (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="btn btn-outline-blue"
                          style={{ padding: '6px 14px', fontSize: '0.76rem' }}
                        >
                          <Check size={13} /> Mark as Read
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          ✓ Read
                        </span>
                      )}
                    </div>

                    {isExpiry && (
                      <Link
                        to="/dashboard"
                        className="btn btn-electric"
                        style={{ padding: '6px 16px', fontSize: '0.76rem' }}
                      >
                        <span>Renew Now</span>
                        <ExternalLink size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
