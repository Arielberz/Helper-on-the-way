import React from "react";

export default function ChatHeader({
  selectedConversation,
  currentUserId,
  isHelper,
  isEndingTreatment,
  handleEndTreatment,
  setShowReportModal,
  setIsMobileMenuOpen,
}) {
  return (
    <div className="flex h-16 items-center border-b border-[var(--background-dark)] bg-[var(--background)] px-4 md:px-6">
      <div className="flex items-center gap-3 flex-1">
        {/* Hamburger (mobile) */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden"
        >
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

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-light)]/50 text-[var(--primary)]">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold md:text-base">
            {currentUserId === selectedConversation.user?._id
              ? selectedConversation.helper?.username
              : selectedConversation.user?.username}
          </p>
          <p className="truncate text-xs text-[var(--text-secondary)]">
            {selectedConversation.request?.problemType || "בקשת עזרה"}
          </p>
        </div>
      </div>

      {/* End Treatment Button (Helper only) - Centered */}
      {isHelper &&
        selectedConversation.request?.status !== "completed" && (
          <button
            onClick={handleEndTreatment}
            disabled={isEndingTreatment}
            className="glass px-3 py-1.5 text-xs md:text-sm font-medium transition-all hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            style={{
              backgroundColor: "var(--glass-bg-strong)",
              backdropFilter: "blur(var(--glass-blur))",
              WebkitBackdropFilter: "blur(var(--glass-blur))",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--rounded-lg)",
              boxShadow: "var(--glass-shadow)",
              color: "var(--primary-dark)",
            }}
          >
            <span>🏁</span>
            <span>סיום טיפול</span>
          </button>
        )}

      <div className="flex items-center gap-2 flex-1 justify-end">
        <button
          onClick={() => setShowReportModal(true)}
          className="text-sm text-[var(--text-light)] hover:text-[var(--danger)]"
        >
          דווח
        </button>
      </div>
    </div>
  );
}
