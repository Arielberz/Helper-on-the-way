import React from 'react';

export default function NearbyButton({ onClick, count }) {
  return (
    <button
      className="glass flex items-center gap-2 px-4 py-2 font-semibold text-primary hover:bg-glass-hover transition-all duration-theme-slow"
      onClick={onClick}
      aria-label="Show nearby requests"
    >
      <span className="text-2xl">📍</span>
      <span className="text-sm font-medium">{count} Nearby</span>
    </button>
  );
}
