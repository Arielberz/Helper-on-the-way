import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";



export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const API_URL = process.env.API_URL;

    try {
      const response = await axios.post(`${API_URL}/api/users/login`, {
        identifier,
        password
      });

      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem("token", response.data.data.token);
        if (response.data.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.data.user));
        }
        // Redirect to home page
        navigate("/home");
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      let msg = "שגיאה בהתחברות. נסה שוב.";
      switch (serverMsg) {
        case "identifier and password are required":
          msg = "יש לספק מזהה (אימייל/טלפון/שם משתמש) וסיסמה";
          break;
        case "invalid credentials":
          msg = "פרטי ההתחברות שגויים";
          break;
        case "server misconfiguration: missing JWT secret":
          msg = "שגיאת שרת: הגדרה חסרה. נסו מאוחר יותר";
          break;
        default:
          if (typeof serverMsg === "string" && serverMsg.trim()) {
            msg = serverMsg;
          }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" dir="rtl" lang="he">
      <button
        type="button"
        className="back-button-floating"
        onClick={() => navigate('/')}
        aria-label="חזרה לעמוד הראשי"
      >
        ← חזרה
      </button>

      <div className="card">
        <form onSubmit={handleSubmit}>

        {/* לוגו */}
         <div className="logo-wrap">
          <img
            src="./helper-logo.jpeg"
            alt="HELPER ON THE WAY - סולידריות בכבישים"
            className="logo-img"
          />
        </div>


        <div className="title">התחברות</div>

        {error && <div style={{color: 'red', marginBottom: '10px', textAlign: 'center'}}>{error}</div>}

        {/* אימייל/טלפון/שם משתמש */}
        <div className="field">
          <div className="field-label">אימייל / טלפון / שם משתמש</div>
          <input 
            className="field-input" 
            type="text" 
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>

        {/* סיסמה */}
        <div className="field">
          <div className="field-label">סיסמה</div>
          <input 
            className="field-input" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="button" type="submit" disabled={loading}>
          {loading ? "מתחבר..." : "כניסה"}
        </button>

        </form>

        <div className="bottom-text">
          אין לך חשבון?
          <Link to="/register">להרשמה</Link>
        </div>

      </div>
    </div>
  );
}