import React from "react";

export default function MapLogo({ mapRef, position }) {
  return (
    <button
      onClick={() => {
        if (mapRef && position) {
          mapRef.flyTo(position, 18, { duration: 1 });
        }
      }}
      className="fixed top-6 left-6 z-1000 backdrop-blur-md bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center gap-3 h-12 w-12 sm:h-auto sm:w-auto sm:px-4 sm:py-2 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/30 cursor-pointer"
      aria-label="Center map on my location"
    >
      <img
        src="/logo.png"
        alt="Helper on the Way"
        className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
      />
      <div className="hidden sm:flex flex-col">
        <span className="text-slate-600 text-xs leading-tight">HELPER</span>
        <span className="text-slate-600 text-xs leading-tight">On the Way</span>
      </div>
    </button>
  );
}
