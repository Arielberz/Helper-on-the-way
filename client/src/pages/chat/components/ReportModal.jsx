import React from "react";

export default function ReportModal({
  reportReason,
  setReportReason,
  reportDescription,
  setReportDescription,
  handleSubmitReport,
  setShowReportModal,
  selectedConversation,
  currentUserId,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={() => setShowReportModal(false)}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <p className="text-sm font-semibold text-gray-800">דיווח על משתמש</p>
          <button
            onClick={() => setShowReportModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 px-4 py-4">
          <p className="text-xs text-gray-600">
            דיווח על:{" "}
            <strong className="text-gray-900">
              {currentUserId === selectedConversation?.user?._id
                ? selectedConversation?.helper?.username
                : selectedConversation?.user?.username}
            </strong>
          </p>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              סיבת הדיווח
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm outline-none focus:border-[var(--primary)]"
            >
              <option value="">בחר סיבה</option>
              <option value="illegal_activity">פעילות בלתי חוקית</option>
              <option value="harassment">הטרדה</option>
              <option value="inappropriate_content">תוכן לא הולם</option>
              <option value="scam">הונאה/רמאות</option>
              <option value="violence_threat">איום באלימות</option>
              <option value="other">אחר</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              תיאור הבעיה
            </label>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              rows="4"
              maxLength="1000"
              className="w-full resize-none rounded-md border border-gray-300 bg-white px-2 py-2 text-sm outline-none focus:border-[var(--primary)]"
              placeholder="אנא תאר בקצרה את הבעיה..."
            />
            <p className="mt-1 text-right text-[10px] text-gray-400">
              {reportDescription.length}/1000
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setShowReportModal(false)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
            >
              ביטול
            </button>
            <button
              onClick={handleSubmitReport}
              className="flex-1 rounded-md bg-[var(--danger)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              שלח דיווח
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
