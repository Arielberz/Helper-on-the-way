import React, { useState } from 'react';
import NearbyRequestsList from '../../NearbyRequestsButton/components/NearbyRequestsList';
import FilterSettingsModal from '../../NearbyRequestsButton/components/FilterSettingsModal';
import { SettingsIcon, MenuIcon } from '../../NearbyRequestsButton/components/Icons';

export default function MapSidebar({ 
  mapRef, 
  userPosition, 
  requests, 
  onSelectRequest 
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [showHelperSettings, setShowHelperSettings] = useState(false);
  
  // Filter state managed here since we're decoupled
  const [filterSettings, setFilterSettings] = useState({
    maxDistance: 100,
    destination: '',
    onlyOnRoute: false,
    problemTypes: [],
    minPayment: 0
  });

  const hasActiveFilters = filterSettings.maxDistance < 100 || filterSettings.problemTypes.length > 0 || filterSettings.minPayment > 0;

  // We need to calculate distances and sort/filter
  const sortedRequests = React.useMemo(() => {
    if (!userPosition || !requests) return [];
    
    // Simple distance calc
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

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
    ? `Filtered: max ${filterSettings.maxDistance}km${filterSettings.problemTypes.length ? `, ${filterSettings.problemTypes.length} types` : ''}`
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

  return (
    <>
      {/* Floating Toggle Button - Visible only when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-[2000] p-3 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105"
          style={{
            background: 'var(--glass-bg-strong)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
          }}
          aria-label="Open sidebar"
        >
          <MenuIcon />
        </button>
      )}

      {/* Full Sidebar - Visible only when open */}
      {isOpen && (
        <div 
          className="fixed top-0 left-0 h-full z-[2000] w-80 transition-transform duration-300 ease-in-out font-sans"
        >
          {/* Sidebar Content Container */}
          <div 
            className="h-full w-full flex flex-col overflow-hidden"
            style={{
              background: 'var(--glass-bg-strong)',
              backdropFilter: 'blur(var(--glass-blur))',
              WebkitBackdropFilter: 'blur(var(--glass-blur))',
              borderRight: '1px solid var(--glass-border)',
              boxShadow: 'var(--glass-shadow)',
            }}
          >
            {/* Header Section (Toggle + Helper Link) */}
            <div className="p-4 border-b border-white/20 shrink-0 space-y-4">
               {/* Top Toolbar: Toggle + Logo */}
               <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg transition-colors hover:bg-white/40 text-gray-700 cursor-pointer shrink-0"
                    aria-label="Close sidebar"
                  >
                     <MenuIcon />
                  </button>

                  {/* Logo Section */}
                  <div className="flex-1">
                    <button
                      onClick={() => {
                        if (mapRef && userPosition) {
                          mapRef.flyTo(userPosition, 18, { duration: 1 });
                        }
                      }}
                      className="flex items-center gap-3 w-full p-1 rounded-xl transition-colors hover:bg-white/40 cursor-pointer"
                    >
                      <img
                        src="/logo.png"
                        alt="Helper on the Way"
                        className="h-8 w-8 object-contain drop-shadow-sm"
                      />
                      <div className="flex flex-col items-start whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-800 leading-tight">HELPER</span>
                        <span className="text-xs font-medium text-blue-600 leading-tight">On the Way</span>
                      </div>
                    </button>
                  </div>
               </div>

              
              {/* Native Section Title & Filters */}
              <div className="flex items-end justify-between px-2" dir="rtl">
                 <div>
                    <h3 className="text-lg font-bold text-gray-800">בקשות קרובות</h3>
                    <p className="text-xs text-gray-600 mt-0.5">{filterSummary}</p>
                 </div>
                 <button
                    onClick={() => setShowHelperSettings(true)}
                    className={`p-2 rounded-lg transition-all ${
                       hasActiveFilters ? 'bg-blue-100 text-blue-600' : 'bg-white/50 text-gray-500 hover:bg-white'
                    }`}
                    title="Filter Settings"
                 >
                    <SettingsIcon />
                 </button>
              </div>
            </div>

            {/* List Section */}
            <div className="flex-1 overflow-hidden relative">
              <NearbyRequestsList
                showList={true}
                closeList={() => {}} // No close needed here
                filterSummary={filterSummary}
                setShowHelperSettings={setShowHelperSettings}
                hasActiveFilters={hasActiveFilters}
                sortedRequests={sortedRequests}
                onSelectRequest={onSelectRequest}
                asSidebar={true} 
                embedded={true} // New prop to tell list it's inside a container
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Modal (kept outside to layer properly) */}
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
