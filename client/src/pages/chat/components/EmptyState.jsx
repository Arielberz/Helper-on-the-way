import React from "react";

export default function EmptyState({ setIsMobileMenuOpen }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-[var(--text-secondary)]">
      {/* Mobile header with hamburger when no conversation */}
      <div className="absolute top-0 left-0 right-0 flex h-12 items-center border-b border-[var(--background-dark)] bg-[var(--background)] px-4 md:hidden">
        <button onClick={() => setIsMobileMenuOpen(true)} className="mr-2">
          <svg
            className="h-6 w-6 text-[var(--text-main)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <span className="text-sm font-semibold text-[var(--text-main)]">
          השיחות שלי
        </span>
      </div>

      <div className="mt-10 text-center md:mt-0">
        <p className="mb-1 text-lg font-semibold">בחר שיחה</p>
        <p className="mb-4 text-sm text-[var(--text-light)]">
          בחר שיחה מהתפריט כדי להתחיל לשוחח
        </p>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="glass mt-2 px-4 py-2 text-sm font-medium text-[var(--primary-dark)] md:hidden"
        >
          פתח תפריט שיחות
        </button>
      </div>
    </div>
  );
}
