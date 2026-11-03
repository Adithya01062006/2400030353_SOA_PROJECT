import React from 'react';
import { Package, CreditCard, LayoutDashboard } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Choose a Plan',
      desc: 'Browse our transparent subscription catalog (Basic, Pro, Enterprise) and pick the duration that fits your needs.',
      icon: Package
    },
    {
      num: '02',
      title: 'Subscribe Securely',
      desc: 'Process instant mock payments verified over OpenFeign. Receive cryptographic JWT authorization for protected access.',
      icon: CreditCard
    },
    {
      num: '03',
      title: 'Track & Manage',
      desc: 'Monitor start and expiry dates in real time. Renew or cancel anytime with one-click actions from your personal dashboard.',
      icon: LayoutDashboard
    }
  ];

  return (
    <section id="how-it-works" style={{ padding: '90px 24px', position: 'relative' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{ fontSize: '0.8rem', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            SIMPLE 3-STEP ONBOARDING
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, marginTop: '8px', marginBottom: '12px' }}>
            HOW <span className="gradient-text">SUBTRACK WORKS</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
            Getting started takes less than two minutes.
          </p>
        </div>

        <div className="grid-3" style={{ gap: '32px' }}>
          {steps.map((s, idx) => {
            const IconComp = s.icon;
            return (
              <div key={idx} className="glass-card" style={{ position: 'relative', padding: '36px 28px' }}>
                <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'rgba(56, 189, 248, 0.15)', position: 'absolute', top: '20px', right: '24px', lineHeight: 1 }}>
                  {s.num}
                </div>

                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: '24px' }}>
                  <IconComp size={24} />
                </div>

                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px', color: '#f8fafc' }}>{s.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
