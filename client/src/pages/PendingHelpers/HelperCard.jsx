import React from 'react';

export function HelperCard({ 
  helper, 
  distance, 
  processingHelperId, 
  onConfirm, 
  onReject 
}) {
  // Safety check for user data
  if (!helper.user || !helper.user.username) {
    return null;
  }

  const isProcessing = processingHelperId === helper.user._id;

  return (
    <div className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all bg-white">
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {helper.user.avatar ? (
            <img 
              src={helper.user.avatar} 
              alt={helper.user.username}
              className="h-16 w-16 rounded-full object-cover shadow-md border-2 border-blue-200"
            />
          ) : (
            <div className="h-16 w-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {helper.user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {helper.user.username}
          </h3>
          
          {/* Rating */}
          {helper.user.averageRating ? (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                <span className="text-yellow-600 font-bold text-lg">
                  {helper.user.averageRating.toFixed(1)}
                </span>
                <span className="text-yellow-500 text-lg">⭐</span>
              </div>
              <span className="text-sm text-gray-500">
                ({helper.user.ratingCount || 0} reviews)
              </span>
            </div>
          ) : (
            <div className="text-sm text-gray-500 mb-2">
              No ratings yet
            </div>
          )}

          {/* Distance */}
          {distance !== null && (
            <div className="flex items-center gap-1 text-blue-600 font-medium text-sm mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{distance.toFixed(1)} km away</span>
            </div>
          )}

          {/* Request Time */}
          <p className="text-gray-400 text-xs">
            🕐 Requested {new Date(helper.requestedAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onConfirm(helper.user._id)}
          disabled={isProcessing}
          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Confirming...
            </span>
          ) : (
            '✅ Confirm & Chat'
          )}
        </button>
        <button
          onClick={() => onReject(helper.user._id)}
          disabled={isProcessing}
          className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Rejecting...
            </span>
          ) : (
            '❌ Reject'
          )}
        </button>
      </div>
    </div>
  );
}
