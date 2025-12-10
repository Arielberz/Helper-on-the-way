import React from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../utils/apiConfig';

export function ConfirmedHelper({ request }) {
  const navigate = useNavigate();

  if (!request.helper) return null;

  const handleOpenChat = async () => {
    const token = localStorage.getItem('token');
    try {
      // Get or create conversation for this request
      const response = await fetch(
        `${API_BASE}/api/chat/conversation/request/${request._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const chatData = await response.json();
        const conversationId = chatData.data?.conversation?._id || chatData.data?._id;

        if (conversationId) {
          navigate('/chat', { state: { conversationId } });
        } else {
          alert('Unable to open chat. Please try again.');
        }
      } else {
        alert('Unable to open chat. Please try again.');
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      alert('Unable to open chat. Please try again.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md p-6 mb-6 border-2 border-green-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">✅</span>
        Confirmed Helper
      </h2>
      
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          {/* Helper Avatar */}
          <div className="flex-shrink-0">
            {request.helper.avatar ? (
              <img 
                src={request.helper.avatar} 
                alt={request.helper.username}
                className="h-20 w-20 rounded-full object-cover shadow-md border-2 border-green-200"
              />
            ) : (
              <div className="h-20 w-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
                {request.helper.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Helper Info */}
          <div className="flex-1">
            <p className="text-xl font-bold text-gray-900 mb-2">
              {request.helper.username}
            </p>
            {request.helper.averageRating && (
              <div className="inline-flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                <span className="text-yellow-600 font-bold text-lg">
                  {request.helper.averageRating.toFixed(1)}
                </span>
                <span className="text-yellow-500 text-lg">⭐</span>
                <span className="text-sm text-gray-500 ml-1">
                  ({request.helper.ratingCount || 0})
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleOpenChat}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          💬 Open Chat
        </button>
      </div>
    </div>
  );
}
