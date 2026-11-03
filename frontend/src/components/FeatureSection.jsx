import React from 'react';
import { Package, ShieldCheck, RefreshCw, BarChart3, Layers, CreditCard, Bell, Sparkles } from 'lucide-react';

export default function FeatureSection() {
  const features = [
    {
      icon: Layers,
      title: 'Manage Plans',
      description: 'Explore and choose the best subscription plans tailored for your budget and feature needs.',
      badge: 'Flexible Catalog'
    },
    {
      icon: ShieldCheck,
      title: 'Secure Payments',
      description: 'Safe, simple, and reliable mock payment processing with logged transaction reference IDs.',
      badge: 'JWT Protected'
    },
    {
      icon: RefreshCw,
      title: 'Automatic Renewals',
      description: 'Never miss an important renewal with automated state management and instant extensions.',
      badge: 'Zero Friction'
    },
    {
      icon: BarChart3,
      title: 'Track & Grow',
      description: 'Monitor your spending, receive pre-expiry warnings, and make smarter financial decisions.',
      badge: 'Real-Time Insights'
    }
  ];

  return (
    <section id="features" style={{ padding: '90px 24px', position: 'relative', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{ fontSize: '0.8rem', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            POWERFUL CAPABILITIES
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, marginTop: '8px', marginBottom: '12px' }}>
            EVERYTHING YOU NEED <span className="gradient-text">IN ONE PLACE</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
            Manage your subscription lifecycle with clarity, security, and total confidence.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '28px' }}>
          {features.map((f, i) => {
            const IconComp = f.icon;
            return (
              <div key={i} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '32px 28px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                      <IconComp size={24} />
                    </div>
                    <span className="badge badge-active" style={{ fontSize: '0.65rem', padding: '4px 10px' }}>{f.badge}</span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px', color: '#f8fafc' }}>{f.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
