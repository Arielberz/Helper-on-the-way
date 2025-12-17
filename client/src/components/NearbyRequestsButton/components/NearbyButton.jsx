import React from 'react';

export default function NearbyButton({ onClick, count }) {
  return (
    <button
      onClick={onClick}
      aria-label="Show nearby requests"
      className="glass flex items-center gap-3 font-semibold text-base px-6 py-3 transition-all"
      style={{
        backgroundColor: 'var(--glass-bg-strong)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--rounded-xl)',
        boxShadow: 'var(--glass-shadow)',
        color: 'var(--primary)',
        transitionDuration: 'var(--transition-slow)'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.45)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--glass-bg-strong)'; }}
    >
      <span className="text-xl">📍</span>
      <span className="text-sm font-medium">{count} בקרבת מקום</span>
    </button>
  );
}
