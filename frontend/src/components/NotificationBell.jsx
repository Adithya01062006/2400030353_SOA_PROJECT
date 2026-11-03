import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, Clock, MessageSquare, AlertTriangle, ExternalLink } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnreadCount = async () => {
    if (!user?.userId) return;
    try {
      const res = await api.get(`/api/notifications/unread-count/${user.userId}`);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      // Silently catch in case service is starting up
    }
  };

  const fetchNotifications = async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/notifications/user/${user.userId}`);
      setNotifications(res.data || []);
      const unread = (res.data || []).filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // When dropdown opens, fetch latest notifications
  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.userId) return;
    try {
      await api.put(`/api/notifications/user/${user.userId}/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={handleToggle}
        aria-label="View notifications"
        style={{
          position: 'relative',
          background: isOpen ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)',
          border: isOpen ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid var(--border-color)',
          color: unreadCount > 0 ? '#38bdf8' : 'var(--text-secondary)',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 800,
              minWidth: '18px',
              height: '18px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)',
              animation: 'pulse 2s infinite'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '48px',
            right: 0,
            width: '360px',
            maxWidth: '90vw',
            background: 'var(--bg-card-solid, #0f172a)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            boxShadow: 'var(--card-shadow, 0 16px 36px rgba(0, 0, 0, 0.45))',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--card-inner-bg, rgba(255, 255, 255, 0.02))'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px'
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 6px',
                  borderRadius: '6px'
                }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary, #94a3b8)', fontSize: '0.85rem' }}>
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-secondary, #94a3b8)' }}>
                <Bell size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <p style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>No notifications yet</p>
                <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '4px' }}>
                  You're all caught up with your subscription alerts!
                </p>
              </div>
            ) : (
              notifications.slice(0, 6).map((n) => {
                const isExpiry = n.type === 'EXPIRY_ALERT';
                return (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-color)',
                        background: n.read ? 'transparent' : 'rgba(56, 189, 248, 0.08)',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      {/* Icon */}
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: isExpiry ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                          color: isExpiry ? '#f87171' : '#38bdf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}
                      >
                        {isExpiry ? <AlertTriangle size={16} /> : <MessageSquare size={16} />}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              color: isExpiry ? '#f87171' : '#38bdf8'
                            }}
                          >
                            {isExpiry ? 'Expiry Alert' : 'SubTrack Notice'}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                            {formatTimestamp(n.createdAt)}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: '0.82rem',
                            color: 'var(--text-primary)',
                            margin: '2px 0 6px',
                            lineHeight: 1.4,
                            fontWeight: n.read ? 400 : 600
                          }}
                        >
                          {n.message}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                          {!n.read ? (
                            <button
                              onClick={(e) => handleMarkAsRead(n.id, e)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#38bdf8',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: 0
                              }}
                            >
                              <Check size={12} /> Mark as read
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Read</span>
                          )}

                          {isExpiry && (
                            <Link
                              to="/dashboard"
                              onClick={() => setIsOpen(false)}
                              style={{
                                fontSize: '0.72rem',
                                color: '#38bdf8',
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              Renew <ExternalLink size={11} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer View All Link */}
            {notifications.length > 0 && (
              <div
                style={{
                  padding: '10px 16px',
                  borderTop: '1px solid var(--border-color)',
                  textAlign: 'center',
                  background: 'var(--card-inner-bg, rgba(255, 255, 255, 0.02))'
                }}
              >
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                style={{
                  fontSize: '0.8rem',
                  color: '#38bdf8',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                View all notifications ({notifications.length}) →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
