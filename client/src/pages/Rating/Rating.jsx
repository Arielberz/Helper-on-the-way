import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import RatingModal from "../../components/RatingModal/RatingModal";

export default function Rating() {
  const [searchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [helperName, setHelperName] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get requestId and helperName from URL parameters
    const reqId = searchParams.get('requestId');
    const helper = searchParams.get('helperName');
    
    if (reqId) {
      setRequestId(reqId);
      setHelperName(helper);
      setShowModal(true);
    }
  }, [searchParams]);

  const handleClose = () => {
    setShowModal(false);
    navigate('/home');
  };

  const handleSuccess = () => {
    setShowModal(false);
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <img
          src="/helper-logo.jpeg"
          className="w-32 h-32 mx-auto mb-6 rounded-full object-cover"
          alt="Helper On The Way"
        />

        <h1 className="text-3xl font-bold text-gray-800 mb-4">דירוג השירות</h1>
        <p className="text-gray-600 mb-8">נשמח לשמוע איך הייתה החוויה שלך</p>

        <div className="space-y-4">
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            דרג עכשיו
          </button>

          <button
            onClick={() => navigate('/home')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all"
          >
            חזרה לדף הבית
          </button>
        </div>
      </div>

      {showModal && requestId && (
        <RatingModal
          requestId={requestId}
          helperName={helperName}
          onClose={handleClose}
          onSubmitSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
