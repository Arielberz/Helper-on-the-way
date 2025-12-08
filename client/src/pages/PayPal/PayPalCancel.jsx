import { useNavigate } from 'react-router-dom';

export default function PayPalCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-yellow-600 mb-2">התשלום בוטל</h2>
        <p className="text-gray-600 mb-6">ביטלת את התשלום דרך PayPal</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            חזרה לפרופיל
          </button>
          <button
            onClick={() => navigate('/home')}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            חזרה לדף הבית
          </button>
        </div>
      </div>
    </div>
  );
}
