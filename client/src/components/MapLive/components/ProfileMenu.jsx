/*
  קובץ זה אחראי על:
  - תפריט פרופיל המשתמש במפה
  - ניווט לפרופיל, ארנק והגדרות
  - כפתור התנתקות מהמערכת
  - הצגת מידע משתמש בסיסי
*/

import React from "react";
import { clearAuthData } from "../../../utils/authUtils";

export default function ProfileMenu({
  showProfileMenu,
  setShowProfileMenu,
  unreadCount,
  navigate,
}) {
  return (
    <div className="fixed top-6 right-6 z-1000">
      <button
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        className="relative h-12 w-12 flex items-center justify-center transition-all"
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
        aria-label="Profile Menu"
      >
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full ring-2 ring-white" />
        )}
        <svg
          className="h-6 w-6 text-slate-700"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      </button>

      {showProfileMenu && (
        <>
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setShowProfileMenu(false)}
          />
          <div
            className="absolute top-14 right-0 overflow-hidden min-w-40 animate-fade-in"
            style={{
              backgroundColor: 'var(--glass-bg-strong)',
              backdropFilter: 'blur(var(--glass-blur))',
              WebkitBackdropFilter: 'blur(var(--glass-blur))',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--rounded-xl)',
              boxShadow: 'var(--glass-shadow)'
            }}
          >
            <button
              onClick={() => {
                navigate("/profile");
                setShowProfileMenu(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors"
              style={{ color: 'var(--text-main)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.20)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="font-medium">פרופיל</span>
            </button>
            <button
              onClick={() => {
                navigate("/chat");
                setShowProfileMenu(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors border-t"
              style={{ color: 'var(--text-main)', borderColor: 'rgba(255,255,255,0.2)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.20)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2h-4l-4 4-4-4H9z"
                />
              </svg>
              <span className="font-medium">צ'אט</span>
              {unreadCount > 0 && (
                <span className="ml-auto h-2.5 w-2.5 bg-red-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => {
                clearAuthData();
                navigate("/login");
                setShowProfileMenu(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors border-t"
              style={{ color: 'var(--danger)', borderColor: 'rgba(255,255,255,0.2)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.20)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="font-medium">התנתקות</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
