import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Package, History, Shield, LogIn, UserPlus, Bell, BarChart3 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      className="navbar-glass"
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? 'var(--nav-bg-scrolled)' : 'var(--nav-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        transition: 'all 0.3s ease',
        padding: scrolled ? '12px 24px' : '16px 24px'
      }}
    >
      <div
        style={{
          maxWidth: '1320px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        {/* Left: Brand Logo & Tagline */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)',
              fontWeight: 900,
              fontSize: '1.4rem',
              color: '#07090e'
            }}
          >
            S
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              Sub<span style={{ color: '#38bdf8' }}>Track</span>
            </div>
            <div style={{ fontSize: '0.62rem', color: '#38bdf8', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '3px', fontWeight: 700 }}>
              Subscribe • Track • Grow
            </div>
          </div>
        </Link>

        {/* Navigation Links for Authenticated Users */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Link
              to="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: location.pathname === '/dashboard' ? '#38bdf8' : '#cbd5e1',
                background: location.pathname === '/dashboard' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: location.pathname === '/dashboard' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <LayoutDashboard size={15} /> Dashboard
            </Link>

            <Link
              to="/plans"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: location.pathname === '/plans' ? '#38bdf8' : '#cbd5e1',
                background: location.pathname === '/plans' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: location.pathname === '/plans' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <Package size={15} /> Plans Catalog
            </Link>

            <Link
              to="/subscriptions"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: location.pathname === '/subscriptions' ? '#38bdf8' : '#cbd5e1',
                background: location.pathname === '/subscriptions' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: location.pathname === '/subscriptions' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <History size={15} /> My History
            </Link>

            {user.role === 'ADMIN' && (
              <>
                <Link
                  to="/admin/dashboard"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 13px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: location.pathname === '/admin/dashboard' ? '#c084fc' : '#a855f7',
                    background: location.pathname === '/admin/dashboard' ? 'rgba(168, 85, 247, 0.25)' : 'rgba(168, 85, 247, 0.1)',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    boxShadow: location.pathname === '/admin/dashboard' ? '0 0 12px rgba(168, 85, 247, 0.35)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Shield size={14} /> Admin Dash
                </Link>

                <Link
                  to="/admin/reports"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 13px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: location.pathname === '/admin/reports' ? '#38bdf8' : '#0284c7',
                    background: location.pathname === '/admin/reports' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    boxShadow: location.pathname === '/admin/reports' ? '0 0 12px rgba(56, 189, 248, 0.35)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <BarChart3 size={14} /> Reports
                </Link>

                <Link
                  to="/admin/plans"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: location.pathname === '/admin/plans' ? '#c084fc' : '#cbd5e1',
                    background: location.pathname === '/admin/plans' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: location.pathname === '/admin/plans' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Plans
                </Link>

                <Link
                  to="/admin/notifications"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: location.pathname === '/admin/notifications' ? '#c084fc' : '#cbd5e1',
                    background: location.pathname === '/admin/notifications' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: location.pathname === '/admin/notifications' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Bell size={14} /> Alerts
                </Link>
              </>
            )}
          </div>
        )}

        {/* Right Corner User Actions / Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <ThemeToggle />
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <NotificationBell />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
                <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 700 }}>
                  {user.name || user.email}
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: user.role === 'ADMIN' ? '#c084fc' : '#38bdf8',
                    letterSpacing: '0.05em'
                  }}
                >
                  {user.role === 'ADMIN' ? '🛡️ Administrator' : '👤 Regular User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-outline-blue"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.82rem'
                }}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link
                to="/login"
                className="btn btn-outline-blue"
                style={{
                  padding: '9px 22px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}
              >
                <LogIn size={15} /> LOGIN
              </Link>
              <Link
                to="/register"
                className="btn btn-electric"
                style={{
                  padding: '9px 24px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}
              >
                <UserPlus size={15} /> REGISTER
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
