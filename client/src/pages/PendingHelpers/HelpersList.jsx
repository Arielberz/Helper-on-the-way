import React from 'react';
import { HelperCard } from './HelperCard';

export function HelpersList({ 
  helpers, 
  requestLocation,
  processingHelperId, 
  onConfirmHelper,
  onRejectHelper,
  calculateDistance 
}) {
  const hasPendingHelpers = helpers && helpers.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">🤝</span>
        People Who Want to Help
        {hasPendingHelpers && (
          <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
            {helpers.length}
          </span>
        )}
      </h2>

      {!hasPendingHelpers ? (
        <div className="text-center py-12">
          <p className="text-6xl mb-4">⏳</p>
          <p className="text-gray-600 text-lg mb-2">
            No helpers yet
          </p>
          <p className="text-gray-500 text-sm">
            Waiting for someone to respond to your request...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {helpers.map((pendingHelper) => {
            // Calculate distance if helper location is available
            const distance = pendingHelper.location && requestLocation
              ? calculateDistance(
                  requestLocation.lat,
                  requestLocation.lng,
                  pendingHelper.location.lat,
                  pendingHelper.location.lng
                )
              : null;

            return (
              <HelperCard
                key={pendingHelper.user._id}
                helper={pendingHelper}
                distance={distance}
                processingHelperId={processingHelperId}
                onConfirm={onConfirmHelper}
                onReject={onRejectHelper}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
