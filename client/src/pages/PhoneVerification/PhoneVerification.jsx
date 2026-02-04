import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { startPhoneVerification, checkPhoneVerification, getCurrentUser } from '../../services/users.service';

export default function PhoneVerification() {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone'); // phone | code | success
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  // Load user's phone on mount
  useEffect(() => {
    const loadUserPhone = async () => {
      try {
        const response = await getCurrentUser(navigate);
        const userPhoneNumber = response.data?.user?.phone;
        if (userPhoneNumber) {
          setUserPhone(userPhoneNumber);
          setPhone(userPhoneNumber);
        }
      } catch (err) {
        console.error('Error loading user:', err);
      }
    };
    loadUserPhone();
  }, [navigate]);

  // Timer for code expiry
  useEffect(() => {
    if (step === 'code' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, step]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!phone.trim()) {
        throw new Error('נא הזן מספר טלפון');
      }

      if (!phone.startsWith('+')) {
        throw new Error('מספר טלפון חייב להיות בפורמט E.164 (לדוגמה: +972501234567)');
      }

      await startPhoneVerification(phone, navigate);
      setStep('code');
      setTimeLeft(600); // 10 minutes
      setCode('');
    } catch (err) {
      let errorMessage = err.message || 'שגיאה בשליחת קוד אימות';
      
      // Handle Twilio trial account unverified number error
      if (err.message?.includes('unverified') || err.message?.includes('UNAUTHORIZED')) {
        errorMessage = 'מספר הטלפון לא אומת בחשבון Twilio. בחשבון ניסיון, יש לאמת מספרים באתר twilio.com לפני שליחת הודעות. אנא בקר בהגדרות Twilio כדי לאמת את המספר שלך.';
      }
      
      setError(errorMessage);
      console.error('Error sending code:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!code || code.trim().length !== 6) {
        throw new Error('נא הזן קוד בן 6 ספרות');
      }

      await checkPhoneVerification(phone, code.trim(), navigate);
      setStep('success');
    } catch (err) {
      setError(err.message || 'שגיאה באימות הטלפון');
      console.error('Error verifying code:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNewCode = async () => {
    setError('');
    setCode('');
    try {
      await startPhoneVerification(phone, navigate);
      setTimeLeft(600); // Reset timer
    } catch (err) {
      let errorMessage = err.message || 'שגיאה בשליחת קוד חדש';
      
      // Handle Twilio trial account unverified number error
      if (err.message?.includes('unverified') || err.message?.includes('UNAUTHORIZED')) {
        errorMessage = 'מספר הטלפון לא אומת בחשבון Twilio. בחשבון ניסיון, יש לאמת מספרים באתר twilio.com לפני שליחת הודעות. אנא בקר בהגדרות Twilio כדי לאמת את המספר שלך.';
      }
      
      setError(errorMessage);
    }
  };

  const formatPhoneDisplay = (phoneNum) => {
    if (!phoneNum) return '';
    // Show last 4 digits
    return phoneNum.slice(0, -4) + '****';
  };

  const formatTimeLeft = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl" lang="he">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">📱</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">אימות מספר טלפון</h1>
          <p className="text-gray-600 text-sm">אימות מספר הטלפון שלך לשליחת בקשות עזרה</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center text-sm mb-4">
            {error}
          </div>
        )}

        {/* Twilio Trial Info */}
        {error?.includes('Twilio') && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 px-4 py-3 rounded-lg text-sm mb-4">
            <div className="font-semibold mb-2">📱 מספר הטלפון לא אומת בחשבון Twilio</div>
            <p className="mb-2">בחשבון ניסיון של Twilio, יש לאמת מספרי טלפון לפני שליחת הודעות SMS.</p>
            <ol className="list-decimal pr-5 space-y-1">
              <li>
                בקר ב-
                <a
                  href="https://www.twilio.com/user/account/phone-numbers/verified"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  twilio.com/user/account/phone-numbers/verified
                </a>
              </li>
              <li>לחץ על "Add a Verification Phone Number"</li>
              <li>הזן את מספר הטלפון שלך בפורמט: +972XXXXXXXXX</li>
              <li>אמת את הקוד שנשלח לך ב-SMS</li>
              <li>חזור לכאן והנסה שוב</li>
            </ol>
          </div>
        )}

        {/* Step 1: Enter Phone */}
        {step === 'phone' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">מספר טלפון</label>
              <input
                id="phone"
                type="tel"
                placeholder="+972501234567"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError('');
                }}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div className="text-xs text-gray-500">
                פורמט: +972XXXXXXXXX (מספר טלפון בינלאומי)
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'שולח קוד...' : 'שלח קוד אימות'}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-200"
              disabled={loading}
            >
              ביטול
            </button>
          </form>
        )}

        {/* Step 2: Enter Code */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
              <div className="font-medium mb-1">קוד אימות נשלח ל: {formatPhoneDisplay(phone)}</div>
              <div className={timeLeft < 120 ? 'text-red-500 font-semibold' : 'text-gray-600'}>
                {timeLeft > 0 ? `⏱️ קוד תקף עבור: ${formatTimeLeft(timeLeft)}` : '❌ קוד פג תוקף'}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">קוד אימות</label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                placeholder="000000"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setCode(value);
                  setError('');
                }}
                disabled={loading || timeLeft === 0}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-center text-2xl tracking-widest disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div className="text-xs text-gray-500">
                הזן את 6 הספרות מהתוך הודעת SMS
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6 || timeLeft === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'מאמת...' : 'אמת קוד'}
            </button>

            <button
              type="button"
              onClick={handleRequestNewCode}
              disabled={loading || timeLeft > 30}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-200"
            >
              {timeLeft > 30 ? `בקש קוד חדש (${formatTimeLeft(timeLeft)})` : 'בקש קוד חדש'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setCode('');
                setError('');
                setTimeLeft(0);
              }}
              className="w-full text-sm text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              חזור לעריכת מספר הטלפון
            </button>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">אימות הצליח!</h2>
            <p className="text-gray-700 text-sm mb-2">
              מספר הטלפון שלך {formatPhoneDisplay(phone)} אומת בהצלחה.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              כעת תוכל לשלוח בקשות עזרה מהאפליקציה.
            </p>

            <button
              onClick={() => navigate('/home')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              חזור לדף הבית
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          צריך עזרה?{' '}
          <a href="/contact" className="text-blue-600 hover:underline font-semibold">
            צור קשר עם התמיכה
          </a>
        </div>
      </div>
    </div>
  );
}
