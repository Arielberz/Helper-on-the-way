import React from "react";

export default function PaymentModal({
  selectedConversation,
  handlePaymentConfirm,
  isProcessingPayment,
  setShowPaymentPopup,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={() => setShowPaymentPopup(false)}
    >
      <div
        className="w-full max-w-md rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--glass-bg-strong)",
          backdropFilter: "blur(var(--glass-blur))",
          WebkitBackdropFilter: "blur(var(--glass-blur))",
          border: "1px solid var(--glass-border)",
          boxShadow: "var(--glass-shadow)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            borderColor: "var(--glass-border)",
            backgroundColor: "var(--primary)",
          }}
        >
          <h2 className="text-lg font-bold text-white">💳 תשלום</h2>
          <button
            onClick={() => setShowPaymentPopup(false)}
            className="text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
              סכום לתשלום
            </p>
            <p className="text-4xl font-bold" style={{ color: "var(--primary)" }}>
              {selectedConversation?.request?.payment?.offeredAmount || 0}₪
            </p>
          </div>

          <div
            className="p-4 rounded-lg text-sm"
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              color: "var(--text-main)",
              border: "1px solid var(--primary)",
            }}
          >
            <p className="flex items-center gap-2">
              <span>ℹ️</span>
              <span>העוזר יקבל את התגמול שלו לאחר אישור התשלום</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex gap-3"
          style={{ borderColor: "var(--glass-border)" }}
        >
          <button
            onClick={() => setShowPaymentPopup(false)}
            className="flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm"
            style={{
              backgroundColor: "transparent",
              color: "var(--text-main)",
              border: "1px solid var(--glass-border)",
            }}
          >
            ביטול
          </button>
          <button
            onClick={handlePaymentConfirm}
            disabled={isProcessingPayment}
            className="flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--primary)",
              color: "white",
            }}
          >
            {isProcessingPayment ? "עיבוד..." : "שלח תשלום"}
          </button>
        </div>
      </div>
    </div>
  );
}
