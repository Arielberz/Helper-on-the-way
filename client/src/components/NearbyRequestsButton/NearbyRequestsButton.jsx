import { useState, useMemo, useCallback, useEffect } from 'react'
import { calculateDistance } from './utils/nearbyUtils'
import NearbyButton from './components/NearbyButton'
import NearbyRequestsList from './components/NearbyRequestsList'
import FilterSettingsModal from './components/FilterSettingsModal'

const NearbyRequestsButton = ({ requests, userPosition, onSelectRequest, onModalStateChange, forceOpen = false }) => {
  const [showList, setShowList] = useState(false)
  const [showHelperSettings, setShowHelperSettings] = useState(false)
  const [filterSettings, setFilterSettings] = useState({
    maxDistance: 100,
    destination: '',
    onlyOnRoute: false,
    problemTypes: [],
    minPayment: 0
  })

  // Auto-open when forceOpen is enabled
  useEffect(() => {
    if (forceOpen) {
      setShowList(true)
      onModalStateChange?.(true)
    }
  }, [forceOpen])

  const closeList = useCallback(() => {
    // Don't allow closing if forceOpen is enabled
    if (forceOpen) return
    setShowList(false)
    onModalStateChange?.(false)
  }, [onModalStateChange, forceOpen])

  const toggleList = useCallback(() => {
    // Don't allow toggling if forceOpen is enabled
    if (forceOpen) return
    setShowList(s => !s)
    onModalStateChange?.(!showList)
  }, [showList, onModalStateChange, forceOpen])

  const updateSetting = useCallback((key, value) => {
    setFilterSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleProblemTypeChange = useCallback((value) => {
    setFilterSettings(prev => ({
      ...prev,
      problemTypes: prev.problemTypes.includes(value)
        ? prev.problemTypes.filter(t => t !== value)
        : [...prev.problemTypes, value]
    }))
  }, [])

  const hasActiveFilters = filterSettings.maxDistance < 100 || filterSettings.problemTypes.length > 0 || filterSettings.minPayment > 0

  const sortedRequests = useMemo(() => {
    return requests
      .filter(req => req.location?.lat && req.location?.lng && req.status === 'pending')
      .map(req => ({
        ...req,
        distance: calculateDistance(userPosition[0], userPosition[1], req.location.lat, req.location.lng)
      }))
      .filter(req => {
        if (req.distance > filterSettings.maxDistance) return false
        if (filterSettings.problemTypes.length > 0 && !filterSettings.problemTypes.includes(req.problemType)) return false
        if (filterSettings.minPayment > 0 && (req.payment?.offeredAmount || 0) < filterSettings.minPayment) return false
        return true
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10)
  }, [requests, userPosition, filterSettings])

  const filterSummary = hasActiveFilters
    ? `Filtered: max ${filterSettings.maxDistance}km${filterSettings.problemTypes.length ? `, ${filterSettings.problemTypes.length} types` : ''}${filterSettings.minPayment ? `, min ₪${filterSettings.minPayment}` : ''}`
    : 'Nearby Help Requests'

  return (
    <>
      {!forceOpen && <NearbyButton onClick={toggleList} count={sortedRequests.length} />}

      <NearbyRequestsList
        showList={showList}
        closeList={closeList}
        filterSummary={filterSummary}
        setShowHelperSettings={setShowHelperSettings}
        hasActiveFilters={hasActiveFilters}
        sortedRequests={sortedRequests}
        onSelectRequest={onSelectRequest}
        asSidebar={forceOpen}
      />

      <FilterSettingsModal
        showHelperSettings={showHelperSettings}
        setShowHelperSettings={setShowHelperSettings}
        filterSettings={filterSettings}
        updateSetting={updateSetting}
        handleProblemTypeChange={handleProblemTypeChange}
      />
    </>
  )
}

export default NearbyRequestsButton
