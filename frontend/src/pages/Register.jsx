import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Lock, Mail, User, ArrowLeft, Shield } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const res = await register(name, email, password, role);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="auth-container">
      {/* Background glow */}
      <div className="auth-ambient-glow" />

      {/* Back to Home Button */}
      <Link to="/" className="auth-back-btn">
        <ArrowLeft size={14} />
        <span>Back to Home</span>
      </Link>

      {/* Theme Toggle Top Right */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 20 }}>
        <ThemeToggle />
      </div>

      {/* Form Card */}
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo-badge">S</div>
          <h1 className="auth-title">Create SubTrack Account</h1>
          <p className="auth-subtitle">Start tracking and automating your subscriptions</p>
        </div>

        {error && (
          <div style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(153, 27, 27, 0.4)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', fontSize: '0.8rem', marginBottom: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Row 1: Full Name & Account Role */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', marginBottom: '15px' }}>
            <div className="auth-form-group" style={{ marginBottom: 0 }}>
              <label className="auth-label">
                <User size={14} style={{ color: '#38bdf8' }} />
                Full Name
              </label>
              <input
                type="text"
                className="auth-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="auth-form-group" style={{ marginBottom: 0 }}>
              <label className="auth-label">
                <Shield size={14} style={{ color: '#38bdf8' }} />
                Role
              </label>
              <select
                className="auth-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          {/* Row 2: Email Address */}
          <div className="auth-form-group" style={{ marginBottom: '15px' }}>
            <label className="auth-label">
              <Mail size={14} style={{ color: '#38bdf8' }} />
              Email Address
            </label>
            <input
              type="email"
              className="auth-input"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Row 3: Password & Confirm Password */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
            <div className="auth-form-group" style={{ marginBottom: 0 }}>
              <label className="auth-label">
                <Lock size={13} style={{ color: '#38bdf8' }} />
                Password
              </label>
              <input
                type="password"
                className="auth-input"
                placeholder="Min 6 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <div className="auth-form-group" style={{ marginBottom: 0 }}>
              <label className="auth-label">
                <Lock size={13} style={{ color: '#38bdf8' }} />
                Confirm Password
              </label>
              <input
                type="password"
                className="auth-input"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            <UserPlus size={16} />
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
          </button>
        </form>

        <div className="auth-footer-link">
          Already registered? <Link to="/login">Sign In</Link>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.72rem', color: '#475569', zIndex: 10 }}>
        SubTrack Microservices Engine • SOA Project
      </div>
    </div>
  );
}
