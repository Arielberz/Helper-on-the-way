/*
  קובץ זה אחראי על:
  - סיידבאר שיחות בדף הצ'אט
  - רשימת שיחות עם הודעה אחרונה
  - כפתור מחיקת שיחה, ניווט

  הקובץ משמש את:
  - chat.jsx - חלק שמאלי של מסך הצ'אט

  הקובץ אינו:
  - מנהל מצב - מקבל מהאב
  - טוען הודעות - רק מציג
*/

import React from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar({
  conversations,
  selectedConversation,
  currentUserId,
  loadConversation,
  handleDeleteConversation,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) {
  const navigate = useNavigate();

  return (
    <div
      className={`
        fixed inset-y-0 right-0 z-50 w-72 transform bg-[var(--background-dark)] transition-transform md:relative md:translate-x-0 flex flex-col
        ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "translate-x-full md:translate-x-0"
        }
      `}
    >
      <div className="h-full flex flex-col border-l border-[var(--background-dark)]">

        <div className="flex items-center justify-between px-4 pt-4 md:hidden">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            השיחות שלי
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-[var(--text-light)]"
          >
            ✕
          </button>
        </div>


        <div
          onClick={() => navigate("/profile")}
          className="glass m-4 flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/10 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--text-inverted)]">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-main)]">
              הפרופיל שלי
            </p>
          </div>
        </div>


        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-1">
          <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">
            שיחות אחרונות
          </p>

          {conversations.length === 0 ? (
            <div className="mt-8 text-center text-sm text-[var(--text-light)]">
              אין שיחות פעילות
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => {
                const isSelected = selectedConversation?._id === conv._id;
                const hasUnread = conv.messages?.some(
                  (m) => !m.read && m.sender.toString() !== currentUserId
                );

                const partnerName =
                  conv.user?.username === conv.helper?.username
                    ? "שיחה"
                    : currentUserId === conv.user?._id
                    ? conv.helper?.username
                    : conv.user?.username;

                const requestStatus = conv.request?.status;
                const isRequestOpen = requestStatus && requestStatus !== 'completed' && requestStatus !== 'cancelled';

                return (
                  <div
                    key={conv._id}
                    onClick={() => loadConversation(conv._id)}
                    className={`flex w-full items-start justify-between rounded-lg px-3 py-2 text-right text-sm transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-white text-[var(--text-main)]"
                        : "bg-transparent hover:bg-white/60"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium">{partnerName}</p>
                        {hasUnread && (
                          <span className="h-2 w-2 rounded-full bg-[var(--danger)]" />
                        )}
                      </div>
                      <p className="truncate text-xs text-[var(--text-secondary)]">
                        {conv.request?.problemType || "בקשת עזרה"}
                      </p>
                    </div>
                    {!isRequestOpen && (
                      <button
                        onClick={(e) => handleDeleteConversation(conv._id, e)}
                        className="ml-2 text-xs text-[var(--text-light)] hover:text-[var(--danger)]"
                        title="מחק שיחה"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>


        <div className="border-t border-[var(--background)] p-4">
          <button
            onClick={() => navigate("/home")}
            className="glass flex w-full items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[var(--primary-dark)]"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            חזרה לבית
          </button>
        </div>
      </div>
    </div>
  );
}
