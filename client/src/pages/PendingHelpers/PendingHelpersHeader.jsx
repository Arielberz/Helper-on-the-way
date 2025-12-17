import React from 'react';

export function PendingHelpersHeader({ request }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        בקשת העזרה שלך
      </h1>
      
      <div className="space-y-2">
        <p className="text-gray-700">
          <span className="font-semibold">בעיה:</span>{' '}
          {request.problemType?.replace(/_/g, ' ') || 'N/A'}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">תיאור:</span>{' '}
          {request.description || 'N/A'}
        </p>
        {request.location?.address && (
          <p className="text-gray-700">
            <span className="font-semibold">מיקום:</span>{' '}
            {request.location.address}
          </p>
        )}
        <p className="text-gray-700">
          <span className="font-semibold">סטטוס:</span>{' '}
          <span className={`
            inline-block px-3 py-1 rounded-full text-sm font-semibold
            ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
            ${request.status === 'assigned' ? 'bg-blue-100 text-blue-800' : ''}
            ${request.status === 'in_progress' ? 'bg-green-100 text-green-800' : ''}
            ${request.status === 'completed' ? 'bg-gray-100 text-gray-800' : ''}
          `}>
            {request.status}
          </span>
        </p>
      </div>
    </div>
  );
}
