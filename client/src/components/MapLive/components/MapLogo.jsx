import React from "react";

export default function MapLogo({ mapRef, position }) {
  return (
    <button
      onClick={() => {
        if (mapRef && position) {
          mapRef.flyTo(position, 18, { duration: 1 });
        }
      }}
      className="fixed top-6 left-6 z-1000 flex items-center justify-center gap-3 h-12 w-12 sm:h-auto sm:w-auto sm:px-4 sm:py-2 transition-all cursor-pointer"
      style={{
        backgroundColor: 'var(--glass-bg-strong)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--rounded-xl)',
        boxShadow: 'var(--glass-shadow)',
        color: 'var(--text-main)',
        transitionDuration: 'var(--transition-slow)'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.45)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--glass-bg-strong)'; }}
      aria-label="Center map on my location"
    >
      <img
        src="/logo.png"
        alt="Helper on the Way"
        className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
      />
      <div className="hidden sm:flex flex-col">
        <span className="text-xs leading-tight" style={{ color: 'var(--text-secondary)' }}>HELPER</span>
        <span className="text-xs leading-tight" style={{ color: 'var(--text-secondary)' }}>On the Way</span>
      </div>
    </button>
  );
}
