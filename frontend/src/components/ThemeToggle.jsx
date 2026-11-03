import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '', style = {} }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`theme-toggle-btn ${className}`}
      title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      aria-label="Toggle light/dark theme"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        borderRadius: '9999px',
        fontSize: '0.8rem',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        ...style
      }}
    >
      {isLight ? (
        <>
          <Moon size={15} style={{ color: '#6366f1' }} />
          <span>Dark Mode</span>
        </>
      ) : (
        <>
          <Sun size={15} style={{ color: '#f59e0b' }} />
          <span>Light Mode</span>
        </>
      )}
    </button>
  );
}
