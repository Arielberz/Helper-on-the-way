import React, { useState } from "react";



export default function Payment() {
  const [form, setForm] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // פה בעתיד אפשר לחבר לשרת / ספק תשלום
    alert("התשלום נשלח (מדומה) ✅");
  };

  return (
    <div className="payment-page" dir="rtl" lang="he">
      <div className="card">
        {/* לוגו */}
        <div className="logo-wrap">
          <img
            src="./helper-logo.jpeg"
            alt="HELPER ON THE WAY - סולידריות בכבישים"
            className="logo-img"
          />
        </div>

        <div className="title">תשלום</div>
        <div className="subtitle">סיום בקשת הסיוע בתשלום מאובטח</div>

        {/* סיכום תשלום */}
        <div className="summary-box">
          <div className="summary-row">
            <span>סוג שירות</span>
            <span>סיוע בדרך</span>
          </div>
          <div className="summary-row">
            <span>מספר בקשה</span>
            <span>#12345</span>
          </div>
          <div className="summary-row">
            <span>סכום לתשלום</span>
            <span>150 ₪</span>
          </div>
        </div>

        {/* טופס תשלום */}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <div className="field-label">שם בעל הכרטיס</div>
            <input
              className="field-input"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <div className="field-label">מספר כרטיס</div>
            <input
              className="field-input"
              type="text"
              inputMode="numeric"
              name="cardNumber"
              value={form.cardNumber}
              onChange={handleChange}
            />
          </div>

          <div className="field-row">
            <div className="field">
              <div className="field-label">תוקף (MM/YY)</div>
              <input
                className="field-input"
                type="text"
                placeholder="MM/YY"
                name="expiry"
                value={form.expiry}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <div className="field-label">CVV</div>
              <input
                className="field-input"
                type="password"
                inputMode="numeric"
                name="cvv"
                value={form.cvv}
                onChange={handleChange}
              />
            </div>
          </div>

          <button className="button" type="submit">
            שלם עכשיו
          </button>
        </form>

        <div className="note">
          התשלום מתבצע בסביבה מאובטחת. פרטי האשראי אינם נשמרים במערכת.
        </div>
      </div>
    </div>
  );
}
