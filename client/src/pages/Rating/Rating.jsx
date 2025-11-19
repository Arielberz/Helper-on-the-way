import React, { useState } from "react";



export default function Rating() {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  const handleStarClick = (index) => {
    setRating(index + 1); // כוכבים מ-1 עד 5
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // כאן אפשר בעתיד לשלוח לשרת
    alert(`תודה! דירגת ${rating} כוכבים\n${text ? "חוות דעת: " + text : ""}`);
  };

  return (
    <div className="rating-page" dir="rtl" lang="he">
      <div className="card">
        {/* לוגו */}
        <div className="logo-wrap">
          <img
            src="./helper-logo.jpeg"
            className="logo-img"
            alt="Helper On The Way"
          />
        </div>

        <div className="title">דירוג השירות</div>
        <div className="subtitle">נשמח לשמוע איך הייתה החוויה שלך</div>

        {/* כוכבים */}
        <div className="stars">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`star ${i < rating ? "active" : ""}`}
              onClick={() => handleStarClick(i)}
            >
              &#9733;
            </span>
          ))}
        </div>

        {/* חוות דעת */}
        <form onSubmit={handleSubmit}>
          <div className="field-label">חוות דעת (לא חובה)</div>
          <textarea
            className="textarea"
            placeholder="כתוב כאן מה דעתך..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* כפתור שליחה */}
          <button className="button" type="submit">
            שלח דירוג
          </button>
        </form>
      </div>
    </div>
  );
}
