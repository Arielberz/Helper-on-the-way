import React from 'react';

export function ProfileHeader({ user, rating, ratingCount, onOpenRatingModal }) {
  const maxRating = 5;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Avatar Section */}
        <div className="relative">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.username}
              className="w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover border-4 sm:border-8 border-white shadow-2xl"
            />
          ) : (
            <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center border-4 sm:border-8 border-white shadow-2xl">
              <span className="text-3xl sm:text-6xl font-bold text-white">
                {user?.username?.[0]?.toUpperCase() || "?"}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-right">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">
            {user?.username || "משתמש"}
          </h1>
          
          {/* Rating Display */}
          <button
            onClick={onOpenRatingModal}
            className="inline-flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-bold py-2 sm:py-3 px-3 sm:px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center gap-1">
              <span className="text-xl sm:text-3xl">{rating.toFixed(1)}</span>
              <span className="text-yellow-300 text-lg sm:text-2xl">⭐</span>
            </div>
            <span className="text-xs sm:text-sm text-white/90">({ratingCount} {ratingCount === 1 ? 'דירוג' : 'דירוגים'})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
