import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Lock, Mail, ArrowLeft } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
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
          <h1 className="auth-title">Welcome to SubTrack</h1>
          <p className="auth-subtitle">Sign in to manage your subscription lifecycle</p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(153, 27, 27, 0.4)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', fontSize: '0.82rem', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label">
              <Mail size={14} style={{ color: '#38bdf8' }} />
              Email Address
            </label>
            <input
              type="email"
              className="auth-input"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">
              <Lock size={14} style={{ color: '#38bdf8' }} />
              Password
            </label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            <LogIn size={16} />
            <span>{loading ? 'Authenticating...' : 'Sign In to SubTrack'}</span>
          </button>
        </form>

        <div className="auth-footer-link">
          Don't have an account? <Link to="/register">Create Account</Link>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.75rem', color: '#475569', zIndex: 10 }}>
        SubTrack Microservices Engine • SOA Project
      </div>
    </div>
  );
}
