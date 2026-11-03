import React from 'react';

export default function FloatingCard({
  icon: Icon,
  title,
  subtitle,
  position,
  animationName = 'floatSlow1',
  duration = '7s',
  animationDelay = '0s'
}) {
  return (
    <div
      style={{
        position: 'absolute',
        ...position,
        zIndex: 10,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6), 0 0 25px rgba(56, 189, 248, 0.2)',
        borderRadius: '16px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        animation: `${animationName} ${duration} ease-in-out infinite`,
        animationDelay: animationDelay,
        whiteSpace: 'nowrap',
        transition: 'transform 0.3s ease, border-color 0.3s ease'
      }}
    >
      {Icon && (
        <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '8px', borderRadius: '10px', display: 'flex', color: '#38bdf8' }}>
          <Icon size={18} />
        </div>
      )}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>{title}</div>
        {subtitle && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{subtitle}</div>}
      </div>
    </div>
  );
}
