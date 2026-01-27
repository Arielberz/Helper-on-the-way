/*
  קובץ זה אחראי על:
  - דף הצלחת תשלום PayPal
  - קליטת עסקה בשרת אחרי אישור המשתמש
  - ניתוב חזרה מ-PayPal עם פרמטרים

  הקובץ משמש את:
  - PayPal redirect - ניתוב אוטומטי מ-PayPal

  הקובץ אינו:
  - מעבד תשלום פיזי - נעשה בשרת
  - שומר פרטי עסקה - רק מקליט
*/

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { capturePayPalOrder } from '../../services/payments.service';

export default function PayPalSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('מעבד תשלום...');

  useEffect(() => {
    const capturePayment = async () => {
      const paypalToken = searchParams.get('token'); // PayPal order ID
      const requestId = searchParams.get('requestId');

      if (!paypalToken || !requestId) {
        setStatus('error');
        setMessage('פרטי תשלום חסרים');
        return;
      }

      try {
        const data = await capturePayPalOrder(paypalToken, requestId);

        if (data.success) {
          setStatus('success');
          setMessage('התשלום בוצע בהצלחה! 🎉');
          
          setTimeout(() => {
            navigate('/profile');
          }, 3000);
        } else {
          console.error('Capture failed:', data);
          setStatus('error');
          setMessage(data.message || 'התשלום נכשל');
        }
      } catch (error) {
        console.error('Error capturing payment:', error);
        setStatus('error');
        setMessage(`שגיאה בעיבוד התשלום: ${error.message}`);
      }
    };

    capturePayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">מעבד תשלום</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">התשלום בוצע בהצלחה!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">מעביר אותך לפרופיל...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">התשלום נכשל</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/profile')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              חזרה לפרופיל
            </button>
          </>
        )}
      </div>
    </div>
  );
}
