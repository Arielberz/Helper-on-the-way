/*
  קובץ זה אחראי על:
  - כותרת המפה במובייל עם תפריטים
  - תפריט המבורגר לניווט במובייל
  - הצגת בקשות סמוכות ופילטרים
  - תפריט פרופיל וכפתורי פעולה
*/

import React, { useState, useMemo } from 'react';
import NearbyRequestsList from '../../NearbyRequestsButton/components/NearbyRequestsList';
import FilterSettingsModal from '../../NearbyRequestsButton/components/FilterSettingsModal';
import { clearAuthData } from '../../../utils/authUtils';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default function MobileMapHeader({ 
  mapRef, 
  userPosition, 
  requests, 
  onSelectRequest, 
  unreadCount, 
  navigate 
}) {
  const [showNearbyList, setShowNearbyList] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showHelperSettings, setShowHelperSettings] = useState(false);
  const [filterSettings, setFilterSettings] = useState({
    maxDistance: 100,
    destination: '',
    onlyOnRoute: false,
    problemTypes: [],
    minPayment: 0
  });

  const hasActiveFilters = filterSettings.maxDistance < 100 || filterSettings.problemTypes.length > 0 || filterSettings.minPayment > 0;

  const sortedRequests = useMemo(() => {
    if (!userPosition || !requests) return [];
    return requests
      .filter(req => req.location?.lat && req.location?.lng && req.status === 'pending')
      .map(req => ({
        ...req,
        distance: calculateDistance(userPosition[0], userPosition[1], req.location.lat, req.location.lng)
      }))
      .filter(req => {
        if (req.distance > filterSettings.maxDistance) return false;
        if (filterSettings.problemTypes.length > 0 && !filterSettings.problemTypes.includes(req.problemType)) return false;
        if (filterSettings.minPayment > 0 && (req.payment?.offeredAmount || 0) < filterSettings.minPayment) return false;
        return true;
      })
      .sort((a, b) => a.distance - b.distance);
  }, [requests, userPosition, filterSettings]);

  const filterSummary = hasActiveFilters
    ? `Filtered: max ${filterSettings.maxDistance}km`
    : 'Nearby Help Requests';

  const updateSetting = (key, value) => {
    setFilterSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleProblemTypeChange = (value) => {
    setFilterSettings(prev => ({
      ...prev,
      problemTypes: prev.problemTypes.includes(value)
        ? prev.problemTypes.filter(t => t !== value)
        : [...prev.problemTypes, value]
    }));
  };

  const buttonStyle = {
    backgroundColor: 'var(--glass-bg-strong)',
    backdropFilter: 'blur(var(--glass-blur))',
    WebkitBackdropFilter: 'blur(var(--glass-blur))',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--rounded-xl)',
    boxShadow: 'var(--glass-shadow)',
  };

  return (
    <>

      <div className="fixed top-4 left-4 right-4 z-[2000] flex items-center justify-between gap-3">

        <button
          onClick={() => {
            if (mapRef && userPosition) {
              mapRef.flyTo(userPosition, 18, { duration: 1 });
            }
          }}
          className="h-12 w-12 flex items-center justify-center shrink-0 transition-transform hover:scale-105"
          style={buttonStyle}
          aria-label="My Location"
        >
          <img
            src="/logo.png"
            alt="Helper"
            className="h-7 w-7 object-contain"
          />
        </button>


        <button
          onClick={() => setShowNearbyList(true)}
          className="h-12 px-5 flex items-center justify-center gap-2 flex-1 max-w-[180px] transition-transform hover:scale-105"
          style={buttonStyle}
          aria-label="Nearby Requests"
        >
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">
            {sortedRequests.length} קרובים
          </span>
        </button>


        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="relative h-12 w-12 flex items-center justify-center shrink-0 transition-transform hover:scale-105"
          style={buttonStyle}
          aria-label="Profile Menu"
        >
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full ring-2 ring-white" />
          )}
          <svg className="h-6 w-6 text-gray-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </button>
      </div>


      {showProfileMenu && (
        <>
          <div className="fixed inset-0 z-[2001]" onClick={() => setShowProfileMenu(false)} />
          <div
            className="fixed top-20 right-4 z-[2002] min-w-40 overflow-hidden"
            style={buttonStyle}
          >
            <button
              onClick={() => { navigate("/profile"); setShowProfileMenu(false); }}
              className="w-full px-4 py-3 flex items-center gap-3 text-left text-gray-800 hover:bg-white/30 transition-colors"
            >
              <span className="font-medium">פרופיל</span>
            </button>
            <button
              onClick={() => { navigate("/chat"); setShowProfileMenu(false); }}
              className="w-full px-4 py-3 flex items-center gap-3 text-left text-gray-800 hover:bg-white/30 transition-colors border-t border-white/20"
            >
              <span className="font-medium">צ'אט</span>
              {unreadCount > 0 && <span className="ml-auto h-2.5 w-2.5 bg-red-500 rounded-full" />}
            </button>
            <button
              onClick={() => { clearAuthData(); navigate("/login"); setShowProfileMenu(false); }}
              className="w-full px-4 py-3 flex items-center gap-3 text-left text-red-500 hover:bg-white/30 transition-colors border-t border-white/20"
            >
              <span className="font-medium">התנתקות</span>
            </button>
          </div>
        </>
      )}


      <NearbyRequestsList
        showList={showNearbyList}
        closeList={() => setShowNearbyList(false)}
        filterSummary={filterSummary}
        setShowHelperSettings={setShowHelperSettings}
        hasActiveFilters={hasActiveFilters}
        sortedRequests={sortedRequests}
        onSelectRequest={(req) => { onSelectRequest(req); setShowNearbyList(false); }}
        asSidebar={false}
        embedded={false}
      />


      <FilterSettingsModal
        showHelperSettings={showHelperSettings}
        setShowHelperSettings={setShowHelperSettings}
        filterSettings={filterSettings}
        updateSetting={updateSetting}
        handleProblemTypeChange={handleProblemTypeChange}
      />
    </>
  );
}
