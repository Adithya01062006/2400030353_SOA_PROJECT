import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import OrbitParticles from './OrbitParticles';
import OrbitRings from './OrbitRings';
import FloatingCard from './FloatingCard';
import { ArrowRight, Clock, CheckCircle2, CreditCard, PieChart, Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import heroMockup from '../assets/hero-mockup.png';

export default function Hero() {
  const [imgError, setImgError] = useState(false);
  return (
    <section id="hero" style={{ position: 'relative', padding: '60px 24px 100px 24px', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center' }}>
      
      {/* Background Soft Glow Effects */}
      <div style={{ position: 'absolute', top: '20%', right: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(99, 102, 241, 0.1) 40%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', top: '40%', left: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 60%)', filter: 'blur(40px)', pointerEvents: 'none', zIndex: 1 }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '48px', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        
        {/* HERO LEFT COLUMN */}
        <div>
          {/* Eyebrow Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#38bdf8',
              letterSpacing: '0.1em',
              marginBottom: '24px'
            }}
          >
            <Sparkles size={14} /> SMART SUBSCRIPTIONS • BETTER TOMORROWS
          </div>

          {/* Main Heading */}
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '20px' }}>
            Take Control <br />
            of <span className="gradient-text">Your Subscriptions</span>
          </h1>

          {/* Supporting Text */}
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '540px', marginBottom: '36px' }}>
            SubTrack helps you manage, track, and grow your subscriptions — all in one place. Stay organized, never miss a renewal, and make smarter decisions today for a better tomorrow.
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '48px' }}>
            <Link to="/register" className="btn btn-electric" style={{ padding: '14px 32px', fontSize: '1.05rem' }}>
              Get Started <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn btn-outline-blue" style={{ padding: '14px 30px', fontSize: '1.05rem' }}>
              Learn More
            </a>
          </div>

          {/* Value Indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Track</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>Everything</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Manage</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>Effortlessly</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Grow</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>Confidently</div>
            </div>
          </div>
        </div>

        {/* HERO RIGHT COLUMN — USER REFERENCE PICTURE WITH ADJUSTED BOX POSITIONS & SPEED */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '540px' }}>
          
          {/* ORBITAL RINGS & DYNAMIC PARTICLES */}
          <OrbitRings />
          <OrbitParticles count={28} />

          {/* 4 FLOATING NOTIFICATION BOXES (Top-left & Bottom-right closer to picture, faster float speed) */}
          <FloatingCard
            icon={Clock}
            title="Renewal in 12 days"
            subtitle="Premium Plan ($499)"
            position={{ top: '5px', left: '-20px' }}
            animationName="floatSlow1"
            duration="5.5s"
          />
          <FloatingCard
            icon={CheckCircle2}
            title="3 Active Plans"
            subtitle="100% Tracked"
            position={{ top: '25px', right: '-30px' }}
            animationName="floatSlow2"
            duration="6s"
          />
          <FloatingCard
            icon={CreditCard}
            title="Payment Successful"
            subtitle="TXN-1789573912136"
            position={{ bottom: '25px', left: '-30px' }}
            animationName="floatSlow3"
            duration="5.8s"
          />
          <FloatingCard
            icon={PieChart}
            title="₹2,497 Total Spent"
            subtitle="Monthly Analytics"
            position={{ bottom: '5px', right: '-15px' }}
            animationName="floatSlow4"
            duration="6.5s"
          />

          {/* USER REFERENCE MOCKUP IMAGE WITH GLASSMORPHISM BORDER & AMBIENT GLOW */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '560px',
              borderRadius: '24px',
              overflow: 'hidden',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85), 0 0 50px rgba(2, 132, 199, 0.25)',
              zIndex: 8,
              transition: 'transform 0.5s ease, box-shadow 0.5s ease',
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(12px)'
            }}
          >
            {!imgError ? (
              <img
                src={heroMockup}
                alt="SubTrack Subscription Management Workspace"
                onError={() => setImgError(true)}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '24px',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))' }}>
                {/* Header Window Dots */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} style={{ color: '#38bdf8' }} /> SubTrack Enterprise Dashboard
                  </div>
                  <div style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 600 }}>LIVE</div>
                </div>

                {/* Dashboard Metric Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Active Subscriptions</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>12 Plans</div>
                    <div style={{ fontSize: '0.68rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '3px' }}>
                      <TrendingUp size={12} /> 100% On Time
                    </div>
                  </div>
                  <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Monthly Spend</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>₹3,890</div>
                    <div style={{ fontSize: '0.68rem', color: '#38bdf8', marginTop: '3px' }}>Next: Nov 15</div>
                  </div>
                  <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Auto-Renewals</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a855f7', marginTop: '4px' }}>Protected</div>
                    <div style={{ fontSize: '0.68rem', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '3px' }}>
                      <Zap size={12} /> Zero Overcharges
                    </div>
                  </div>
                </div>

                {/* Subscriptions Mini-Table */}
                <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '10px' }}>Active Monitored Services</div>
                  {[
                    { name: 'Enterprise Cloud Suite', cost: '₹1,499/yr', status: 'ACTIVE', badge: 'rgba(16, 185, 129, 0.15)', text: '#34d399' },
                    { name: 'Developer Pro Workspace', cost: '₹499/mo', status: 'ACTIVE', badge: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8' },
                    { name: 'Essential Starter Kit', cost: '₹199/mo', status: 'RENEWING', badge: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24' }
                  ].map((sub, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <div style={{ fontSize: '0.8rem', color: '#f1f5f9', fontWeight: 600 }}>{sub.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500 }}>{sub.cost}</span>
                        <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '999px', background: sub.badge, color: sub.text, fontWeight: 700 }}>{sub.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </section>
  );
}
