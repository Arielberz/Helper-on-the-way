import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setAuthData } from "../../utils/authUtils";



export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const API_URL = import.meta.env.VITE_API_URL;
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const navigate = useNavigate();


  const handleChange = (e) => {
    let value = e.target.value;
    
    // Auto-format phone number as user types
    if (e.target.name === 'phone') {
      // Remove all non-digit characters except +
      value = value.replace(/[^\d+]/g, '');
    }
    
    setFormData({
      ...formData,
      [e.target.name]: value
    });
    setError("");
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setVerificationError("");

    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationError("נא להזין קוד בן 6 ספרות");
      return;
    }

    setVerificationLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/users/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registeredEmail,
          code: verificationCode
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        if (data.data.user && data.data.user.id) {
          localStorage.setItem("userId", data.data.user.id);
        }
        
        // Navigate to home page
        navigate("/home");
      } else {
        // Translate error messages to Hebrew
        const serverMsg = data.message;
        let errorMessage = "אימות נכשל";
        switch (serverMsg) {
          case "email and code are required":
            errorMessage = "אימייל וקוד נדרשים";
            break;
          case "verification code not found":
            errorMessage = "קוד האימות לא נמצא";
            break;
          case "verification code expired":
            errorMessage = "קוד האימות פג תוקף. נא להירשם שוב";
            break;
          case "invalid verification code":
            errorMessage = "קוד אימות שגוי";
            break;
          default:
            if (typeof serverMsg === "string" && serverMsg.trim()) {
              errorMessage = serverMsg;
            }
        }
        setVerificationError(errorMessage);
      }
    } catch (err) {
      console.error(err);
      setVerificationError("שגיאת שרת. אנא נסה שוב מאוחר יותר");
    } finally {
      setVerificationLoading(false);
    }
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
    
    // Validate Israeli mobile number: must start with 05 or +9725
    let phone = String(formData.phone).trim();
    if (!phone.startsWith('05') && !phone.startsWith('+9725')) {
      setError("מספר טלפון חייב להתחיל ב-05 (לדוגמה: 0521234567)");
      return;
    }
    // Check length: 05XXXXXXXX (10 digits) or +9725XXXXXXXX (13 chars)
    if ((phone.startsWith('05') && phone.length !== 10) || 
        (phone.startsWith('+9725') && phone.length !== 13)) {
      setError("מספר טלפון נייד ישראלי חייב להכיל 10 ספרות (05XXXXXXXX)");
      return;
    }

    setLoading(true);

    try {
      // Auto-convert phone to international format before sending
      let phoneToSend = formData.phone.trim();
      if (phoneToSend.startsWith('05')) {
        phoneToSend = '+972' + phoneToSend.substring(1);
      }
      
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          phone: phoneToSend,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Registration successful - show verification modal
        setRegisteredEmail(formData.email);
        setShowVerification(true);
        setError("");
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
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl" lang="he">
      <button
        type="button"
        className="fixed top-6 right-6 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg z-10"
        onClick={() => navigate('/')}
        aria-label="חזרה לעמוד הראשי"
      >
        ← חזרה
      </button>

      {/* Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">📧</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">אימות אימייל</h2>
              <p className="text-gray-600">
                שלחנו קוד אימות בן 6 ספרות לכתובת:
              </p>
              <p className="text-blue-600 font-semibold mt-1">{registeredEmail}</p>
            </div>

            {verificationError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center text-sm mb-4">
                {verificationError}
              </div>
            )}

            <form onSubmit={handleVerification} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">קוד אימות</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-center text-2xl tracking-widest disabled:bg-gray-100 disabled:cursor-not-allowed"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="6"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setVerificationCode(value);
                    setVerificationError("");
                  }}
                  disabled={verificationLoading}
                  placeholder="000000"
                  autoFocus
                />
              </div>

              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={verificationLoading}
              >
                {verificationLoading ? "מאמת..." : "אמת ומשך"}
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600">
              לא קיבלת את הקוד? בדוק בתיקיית הספאם או נסה להירשם שוב
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

        {/* לוגו */}
        <div className="flex justify-center mb-4">
          <img
            src="./helper-logo.jpeg"
            alt="HELPER ON THE WAY - סולידריות בכבישים"
            className="h-24 w-24 object-contain rounded-full"
          />
        </div>

        <div className="text-3xl font-bold text-center text-gray-800 mb-6">הרשמה</div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* שם מלא */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">שם מלא</label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" 
              type="text" 
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* מספר טלפון */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">מספר טלפון</label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* אימייל */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">אימייל</label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* סיסמה */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">סיסמה</label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* אימות סיסמה */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">אימות סיסמה</label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" 
              type="password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6" 
            type="submit" 
            disabled={loading}
          >
            {loading ? "מבצע הרשמה..." : "צור חשבון"}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-600">
          כבר יש לך חשבון?{" "}
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-200">להתחברות</Link>
        </div>

      </div>
    </div>
  );
}