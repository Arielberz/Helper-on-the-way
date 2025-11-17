import React from "react";
import { Link } from "react-router-dom";
import "./Login.css";


export default function Login() {
  return (
    <div className="login-page" dir="rtl" lang="he">

      <div className="card">

        {/* לוגו */}
         <div className="logo-wrap">
          <img
            src="./helper-logo.jpeg"
            alt="HELPER ON THE WAY - סולידריות בכבישים"
            className="logo-img"
          />
        </div>


        <div className="title">התחברות</div>

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

        <button className="button">כניסה</button>

        <div className="bottom-text">
          אין לך חשבון?
          <Link to="/register">להרשמה</Link>
        </div>

      </div>
    </div>
  );
}
