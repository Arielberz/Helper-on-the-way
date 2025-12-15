import React, { useState, useEffect, useRef } from 'react';
import './EtaTimer.css';

const EtaTimer = ({ etaSeconds, lastUpdated }) => {
    const [remainingSeconds, setRemainingSeconds] = useState(etaSeconds);
    const lastServerUpdateRef = useRef(lastUpdated);
    
    useEffect(() => {
        // Calculate elapsed time since server update for accurate sync
        const elapsedSinceUpdate = lastUpdated 
            ? Math.floor((Date.now() - lastUpdated) / 1000)
            : 0;
        
        // Reset remaining time accounting for elapsed time
        const adjustedSeconds = Math.max(0, etaSeconds - elapsedSinceUpdate);
        setRemainingSeconds(adjustedSeconds);
        lastServerUpdateRef.current = lastUpdated;
    }, [etaSeconds, lastUpdated]);
    
    useEffect(() => {
        // Countdown timer that ticks every second for smoother updates
        // Use 1-second interval but only update display every minute
        const interval = setInterval(() => {
            setRemainingSeconds(prev => Math.max(0, prev - 1));
        }, 1000);
        
        return () => clearInterval(interval);
    }, [lastUpdated]); // Reset interval when new server data arrives
    
    // Calculate minutes, show "Arriving" when very close
    const minutes = Math.ceil(remainingSeconds / 60);
    const isArriving = remainingSeconds <= 30; // Less than 30 seconds
    
    return (
        <div className="eta-banner glass">
            <div className="eta-content">
                <span className="eta-icon">{isArriving ? '📍' : '🚗'}</span>
                <div className="eta-text">
                    <span className="eta-status">
                        {isArriving ? 'Helper is arriving!' : 'Helper is on the way'}
                    </span>
                    <span className="eta-time">
                        {isArriving ? (
                            <strong>Almost there...</strong>
                        ) : (
                            <>Estimated arrival in <strong>{Math.max(1, minutes)}</strong> {minutes === 1 ? 'minute' : 'minutes'}</>
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default EtaTimer;
