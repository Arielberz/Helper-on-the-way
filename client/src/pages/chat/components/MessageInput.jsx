/*
  קובץ זה אחראי על:
  - שדה קלט הודעות בצ'אט
  - כפתור שליחה, תמיכה ב-Enter
  - השבתה כששיחה לא נבחרה

  הקובץ משמש את:
  - chat.jsx - חלק תחתון של אזור השיחה

  הקובץ אינו:
  - שולח הודעות בסוקט - האב עושה את זה
  - תומך בקבצים - רק טקסט
*/

import React from "react";

export default function MessageInput({
  input,
  setInput,
  handleSend,
  handleKeyDown,
}) {
  return (
    <div className="border-t border-[var(--background-dark)] bg-[var(--background)] px-4 py-3 md:px-6 md:py-4">
      <div className="mx-auto flex max-w-3xl items-center gap-2">
        <input
          type="text"
          placeholder="הקלד הודעה..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-lg border border-[var(--background-dark)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className={`flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-opacity ${
            !input.trim()
              ? "bg-[var(--primary)] text-white opacity-50 cursor-not-allowed"
              : "bg-[var(--primary)] text-white hover:opacity-90"
          }`}
        >
          שליחה
        </button>
      </div>
    </div>
  );
}
