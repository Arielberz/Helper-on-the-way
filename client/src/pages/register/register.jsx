import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAuthData } from "../../utils/authUtils";
import { API_BASE } from "../../utils/apiConfig";
import { RegisterForm } from "./RegisterForm";
import { EmailVerificationModal } from "./EmailVerificationModal";
import TermsConsentModal from "../../components/TermsConsentModal/TermsConsentModal";

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
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  
  // Terms consent state
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");
  
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
      const response = await fetch(`${API_BASE}/api/users/verify-email`, {
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

    // Show terms modal before proceeding with registration
    setShowTermsModal(true);
  };

  const handleTermsAccept = async () => {
    if (!termsAccepted) {
      setTermsError("חובה לאשר את תנאי השימוש ומדיניות הפרטיות כדי להמשיך.");
      return;
    }
    
    setShowTermsModal(false);
    setTermsError("");
    
    // Now proceed with actual registration
    setLoading(true);

    try {
      // Auto-convert phone to international format before sending
      let phoneToSend = formData.phone.trim();
      if (phoneToSend.startsWith('05')) {
        phoneToSend = '+972' + phoneToSend.substring(1);
      }
      
      const response = await fetch(`${API_BASE}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          phone: phoneToSend,
          email: formData.email,
          password: formData.password,
          termsAccepted: true
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
          case "Must accept Terms & Privacy":
            errorMessage = "חובה לאשר את תנאי השימוש ומדיניות הפרטיות";
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
          case "email or phone already in use":
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

  const handleTermsCancel = () => {
    setShowTermsModal(false);
    setTermsAccepted(false);
    setTermsError("");
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

      {/* Terms Consent Modal */}
      <TermsConsentModal
        isOpen={showTermsModal}
        onAccept={handleTermsAccept}
        onCancel={handleTermsCancel}
        isChecked={termsAccepted}
        onCheckChange={(e) => {
          setTermsAccepted(e.target.checked);
          setTermsError("");
        }}
        error={termsError}
      />

      {/* Verification Modal */}
      <EmailVerificationModal
        isOpen={showVerification}
        email={registeredEmail}
        verificationCode={verificationCode}
        onChangeCode={(e) => {
          const value = e.target.value.replace(/\D/g, '');
          setVerificationCode(value);
          setVerificationError("");
        }}
        onSubmit={handleVerification}
        onCancel={() => setShowVerification(false)}
        error={verificationError}
        loading={verificationLoading}
      />

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

        <RegisterForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          error={error}
          loading={loading}
        />

      </div>
    </div>
  );
}