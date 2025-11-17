import React, { useState } from "react";
import "./Chat.css";


export default function Chat() {
  const [messages, setMessages] = useState([
    { from: "other", text: "שלום! איך אפשר לעזור?" },
    { from: "me", text: "הרכב שלי נתקע בדרך." },
    { from: "other", text: "אני פה בשבילך — ספר לי איפה אתה נמצא." },
    { from: "me", text: "ליד מחלף גנות." },
  ]);

  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "me", text: input.trim() }]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="chat-page" dir="rtl" lang="he">
      <div className="page">
        {/* header */}
        <div className="chat-header">
          <span className="chat-title">צ'אט</span>
          <img src="./helper-logo.jpeg" alt="logo" />
        </div>

        {/* chat messages */}
        <div className="chat-area">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`msg ${m.from === "me" ? "me" : "other"}`}
            >
              {m.text}
            </div>
          ))}
        </div>

        {/* input bar */}
        <div className="input-area">
          <input
            type="text"
            placeholder="הקלד הודעה..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSend}>שלח</button>
        </div>
      </div>
    </div>
  );
}
