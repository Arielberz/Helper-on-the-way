import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./register.css";


export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.username || !formData.phone || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("כל השדות חייבים להיות מלאים");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      return;
    }

    // Match backend rules: min 8 chars
    if (formData.password.length < 8) {
      setError("הסיסמה חייבת להכיל לפחות 8 תווים");
      return;
    }

    // Optional client-side checks aligned with server
    const usernameOk = /^[a-z0-9_.]{3,30}$/.test(String(formData.username).trim().toLowerCase());
    if (!usernameOk) {
      setError("שם המשתמש אינו תקין (3-30 תווים, אותיות/ספרות/._)");
      return;
    }
    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(formData.email).trim());
    if (!emailOk) {
      setError("פורמט האימייל אינו תקין");
      return;
    }
    const phoneOk = /^\+?[1-9]\d{7,14}$/.test(String(formData.phone).trim());
    if (!phoneOk) {
      setError("פורמט הטלפון אינו תקין");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          phone: formData.phone,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        
        // Navigate to home page
        navigate("/home");
      } else {
        // Translate error messages to Hebrew
        const serverMsg = data.message;
        let errorMessage = "ההרשמה נכשלה";
        switch (serverMsg) {
          case "all fields are required":
            errorMessage = "כל השדות חייבים להיות מלאים";
            break;
          case "invalid username format":
            errorMessage = "שם המשתמש אינו תקין";
            break;
          case "invalid email format":
            errorMessage = "פורמט האימייל אינו תקין";
            break;
          case "invalid phone format":
            errorMessage = "פורמט הטלפון אינו תקין";
            break;
          case "password must be at least 8 characters":
            errorMessage = "הסיסמה חייבת להכיל לפחות 8 תווים";
            break;
          case "username, email, or phone already in use":
            errorMessage = "שם משתמש/אימייל/טלפון כבר קיימים במערכת";
            break;
          case "server misconfiguration: missing JWT secret":
            errorMessage = "שגיאת שרת. נסו מאוחר יותר";
            break;
          // Backward compatibility with old message
          case "email already in use":
            errorMessage = "האימייל כבר קיים במערכת";
            break;
          default:
            if (typeof serverMsg === "string" && serverMsg.trim()) {
              errorMessage = serverMsg;
            }
        }
        setError(errorMessage);
      }
    } catch (err) {
      console.error(err);
      setError("שגיאת שרת. אנא נסה שוב מאוחר יותר");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page" dir="rtl" lang="he">
      <button
        type="button"
        className="back-button-floating"
        onClick={() => navigate('/')}
        aria-label="חזרה לעמוד הראשי"
      >
        ← חזרה
      </button>

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

        {error && <div style={{ color: "red", marginBottom: "10px", textAlign: "center" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* שם מלא */}
          <div className="field">
            <div className="field-label">שם מלא</div>
            <input 
              className="field-input" 
              type="text" 
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* מספר טלפון */}
          <div className="field">
            <div className="field-label">מספר טלפון</div>
            <input 
              className="field-input" 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* אימייל */}
          <div className="field">
            <div className="field-label">אימייל</div>
            <input 
              className="field-input" 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* סיסמה */}
          <div className="field">
            <div className="field-label">סיסמה</div>
            <input 
              className="field-input" 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* אימות סיסמה */}
          <div className="field">
            <div className="field-label">אימות סיסמה</div>
            <input 
              className="field-input" 
              type="password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button className="button" type="submit" disabled={loading}>
            {loading ? "מבצע הרשמה..." : "צור חשבון"}
          </button>
        </form>

        <div className="bottom-text">
          כבר יש לך חשבון?
          <Link to="/login">להתחברות</Link>
        </div>

      </div>
    </div>
  );
}