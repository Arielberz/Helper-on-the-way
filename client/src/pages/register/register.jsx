import React from "react";
import { Link } from "react-router-dom";
import "./Register.css";


export default function Register() {
  return (
    <div className="register-page" dir="rtl" lang="he">
      <div className="card">

        {/* לוגו */}
        <div className="logo-wrap">
          <img
            src="./helper-logo.jpeg"
            alt="HELPER ON THE WAY - סולידריות בכבישים"
            className="logo-img"
          />
        </div>

        <div className="title">הרשמה</div>

        {/* שם מלא */}
        <div className="field">
          <div className="field-label">שם מלא</div>
          <input className="field-input" type="text" />
        </div>

        {/* מספר טלפון */}
        <div className="field">
          <div className="field-label">מספר טלפון</div>
          <input className="field-input" type="tel" />
        </div>

        {/* אימייל */}
        <div className="field">
          <div className="field-label">אימייל</div>
          <input className="field-input" type="email" />
        </div>

        {/* סיסמה */}
        <div className="field">
          <div className="field-label">סיסמה</div>
          <input className="field-input" type="password" />
        </div>

        {/* אימות סיסמה */}
        <div className="field">
          <div className="field-label">אימות סיסמה</div>
          <input className="field-input" type="password" />
        </div>

        <button className="button">צור חשבון</button>

        <div className="bottom-text">
          כבר יש לך חשבון?
          <Link to="/login">להתחברות</Link>
        </div>

      </div>
    </div>
  );
}
